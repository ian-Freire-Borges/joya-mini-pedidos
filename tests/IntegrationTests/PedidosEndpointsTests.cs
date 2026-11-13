using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.Data.SqlClient;
using Pedidos.Api;
using Xunit;

[assembly: CollectionBehavior(DisableTestParallelization = true)]

namespace IntegrationTests;

// Cada caso restaura o seed, exclusivamente no Compose de testes.
// A API executa em outro processo, com HTTP e SQL Server reais.
public sealed class PedidosEndpointsTests : IAsyncLifetime
{
    private HttpClient http = null!;
    private string sqlConnection = "";

    public async ValueTask InitializeAsync()
    {
        if (Environment.GetEnvironmentVariable("JOYA_INTEGRATION_ENABLED") != "1")
            throw new InvalidOperationException("Execute pelo docker-compose.tests.yml; banco de testes obrigatório.");

        sqlConnection = Environment.GetEnvironmentVariable("JOYA_INTEGRATION_SQL")
            ?? throw new InvalidOperationException("Conexão de testes ausente.");
        var connection = new SqlConnectionStringBuilder(sqlConnection);
        var api = Environment.GetEnvironmentVariable("JOYA_INTEGRATION_API");
        if (connection.DataSource != "sql" || connection.InitialCatalog != "JoyaPedidos" || api != "http://api:8080")
            throw new InvalidOperationException("Endpoints fora da rede privada esperada do Compose de testes.");

        http = new HttpClient { BaseAddress = new Uri(api), Timeout = TimeSpan.FromSeconds(15) };
        await WaitForApi();
        await Execute("DELETE FROM dbo.ItensPedido; DELETE FROM dbo.Pedidos; DELETE FROM dbo.Produtos; DELETE FROM dbo.Clientes; DELETE FROM dbo.SeedVersions;");
        var seed = await File.ReadAllTextAsync(Path.Combine(AppContext.BaseDirectory, "database", "002-seed.sql"));
        foreach (var batch in Regex.Split(seed, @"^\s*GO\s*$", RegexOptions.Multiline | RegexOptions.IgnoreCase))
            if (!string.IsNullOrWhiteSpace(batch)) await Execute(batch);
    }

    private async Task WaitForApi()
    {
        using var deadline = new CancellationTokenSource(TimeSpan.FromSeconds(60));
        while (true)
        {
            deadline.Token.ThrowIfCancellationRequested();
            try
            {
                using var response = await http.GetAsync("/api/health", deadline.Token);
                if (response.IsSuccessStatusCode) return;
            }
            catch (HttpRequestException) { }
            await Task.Delay(250, deadline.Token);
        }
    }

    public ValueTask DisposeAsync()
    {
        http?.Dispose();
        return ValueTask.CompletedTask;
    }

    private async Task Execute(string query)
    {
        await using var connection = new SqlConnection(sqlConnection);
        await connection.OpenAsync();
        await using var command = new SqlCommand(query, connection);
        await command.ExecuteNonQueryAsync();
    }

    private async Task<T> Scalar<T>(string query)
    {
        await using var connection = new SqlConnection(sqlConnection);
        await connection.OpenAsync();
        await using var command = new SqlCommand(query, connection);
        return (T)(await command.ExecuteScalarAsync())!;
    }

    private async Task<T> Get<T>(string path)
    {
        using var response = await http.GetAsync(path);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return (await response.Content.ReadFromJsonAsync<T>())!;
    }

    private static async Task Problem(HttpResponseMessage response, HttpStatusCode expected)
    {
        Assert.Equal(expected, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
        var problem = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal((int)expected, problem.GetProperty("status").GetInt32());
        Assert.False(string.IsNullOrWhiteSpace(problem.GetProperty("title").GetString()));
    }

    private async Task AssertSeedUnchanged()
    {
        Assert.Equal(6, await Scalar<int>("SELECT COUNT(*) FROM dbo.Pedidos"));
        Assert.Equal(6, await Scalar<int>("SELECT COUNT(*) FROM dbo.ItensPedido"));
        Assert.Equal(50, await Scalar<int>("SELECT Estoque FROM dbo.Produtos WHERE Id=1"));
        Assert.Equal(80, await Scalar<int>("SELECT Estoque FROM dbo.Produtos WHERE Id=2"));
    }

    [Fact]
    public async Task CriacaoPersisteItensPrecoDoServidorEBaixaEstoque()
    {
        using var response = await http.PostAsJsonAsync("/api/pedidos", new CriarPedido(1, [new(2, 2), new(1, 3)]));
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var pedido = (await response.Content.ReadFromJsonAsync<PedidoDto>())!;
        Assert.Equal(628.70m, pedido.Total);
        Assert.Equal(2, pedido.Itens.Count);
        Assert.Equal(1, pedido.ClienteId);
        Assert.Equal($"/api/pedidos/{pedido.Id}", response.Headers.Location?.OriginalString);

        var persisted = await Get<PedidoDto>(response.Headers.Location!.OriginalString);
        Assert.Equal(pedido.Id, persisted.Id);
        Assert.Equal(628.70m, persisted.Total);
        Assert.Equal(7, await Scalar<int>("SELECT COUNT(*) FROM dbo.Pedidos"));
        Assert.Equal(8, await Scalar<int>("SELECT COUNT(*) FROM dbo.ItensPedido"));
        Assert.Equal(47, await Scalar<int>("SELECT Estoque FROM dbo.Produtos WHERE Id=1"));
        Assert.Equal(78, await Scalar<int>("SELECT Estoque FROM dbo.Produtos WHERE Id=2"));
        Assert.Equal(149.90m, persisted.Itens.Single(i => i.ProdutoId == 1).PrecoUnitario);

        // Mudança posterior do catálogo não muda a fotografia de preço no pedido.
        await Execute("UPDATE dbo.Produtos SET Preco=200.00 WHERE Id=1");
        var historical = await Get<PedidoDto>($"/api/pedidos/{pedido.Id}");
        Assert.Equal(628.70m, historical.Total);
        Assert.Equal(149.90m, historical.Itens.Single(i => i.ProdutoId == 1).PrecoUnitario);
    }

    [Theory]
    [InlineData("{\"clienteId\":99999,\"itens\":[{\"produtoId\":1,\"quantidade\":1}]}", 404)]
    [InlineData("{\"clienteId\":1,\"itens\":[]}", 400)]
    [InlineData("{\"clienteId\":1,\"itens\":null}", 400)]
    [InlineData("{\"clienteId\":1,\"itens\":[{\"produtoId\":1,\"quantidade\":0}]}", 400)]
    [InlineData("{\"clienteId\":1,\"itens\":[{\"produtoId\":1,\"quantidade\":1},{\"produtoId\":1,\"quantidade\":1}]}", 400)]
    [InlineData("{\"clienteId\":1,\"itens\":[{\"produtoId\":1,\"quantidade\":51}]}", 409)]
    [InlineData("{\"clienteId\":1,\"itens\":[{\"produtoId\":99999,\"quantidade\":1}]}", 404)]
    [InlineData("{\"clienteId\":1,\"itens\":[{\"produtoId\":1,\"quantidade\":1,\"precoUnitario\":0.01}]}", 400)]
    public async Task PedidoInvalidoRetornaProblemDetailsSemPersistir(string body, int status)
    {
        using var content = new StringContent(body, System.Text.Encoding.UTF8, "application/json");
        using var response = await http.PostAsync("/api/pedidos", content);
        await Problem(response, (HttpStatusCode)status);
        await AssertSeedUnchanged();
    }

    [Theory]
    [InlineData(2, 81, 409)]
    [InlineData(99999, 1, 404)]
    public async Task FalhaNoSegundoProdutoDesfazBaixaDoPrimeiro(int produto, int quantidade, int status)
    {
        // Id 1 é baixado primeiro; o segundo falha. Conferência SQL comprova rollback.
        using var response = await http.PostAsJsonAsync("/api/pedidos", new CriarPedido(1, [new(1, 2), new(produto, quantidade)]));
        await Problem(response, (HttpStatusCode)status);
        await AssertSeedUnchanged();
    }

    [Fact]
    public async Task ComprasConcorrentesNaoVendemMaisQueEstoque()
    {
        await Execute("UPDATE dbo.Produtos SET Estoque=1 WHERE Id=1");
        var start = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
        async Task<HttpResponseMessage> Comprar()
        {
            await start.Task;
            return await http.PostAsJsonAsync("/api/pedidos", new CriarPedido(1, [new(1, 1)]));
        }
        var first = Comprar();
        var second = Comprar();
        start.SetResult();
        var responses = await Task.WhenAll(first, second);
        try
        {
            Assert.Single(responses.Where(r => r.StatusCode == HttpStatusCode.Created));
            var conflict = Assert.Single(responses.Where(r => r.StatusCode == HttpStatusCode.Conflict));
            await Problem(conflict, HttpStatusCode.Conflict);
            Assert.Equal(0, await Scalar<int>("SELECT Estoque FROM dbo.Produtos WHERE Id=1"));
            Assert.Equal(7, await Scalar<int>("SELECT COUNT(*) FROM dbo.Pedidos"));
            Assert.Equal(7, await Scalar<int>("SELECT COUNT(*) FROM dbo.ItensPedido"));
        }
        finally { foreach (var response in responses) response.Dispose(); }
    }

    [Fact]
    public async Task ListagemFiltraPeriodoClienteEPaginaSemDuplicarRegistros()
    {
        var period = await Get<PaginaDto<PedidoDto>>("/api/pedidos?inicio=2026-01-01&fim=2027-01-01");
        Assert.Equal(4, period.TotalRegistros);
        Assert.All(period.Itens, p => Assert.InRange(p.DataPedido, new DateTime(2026, 1, 1), new DateTime(2027, 1, 1).AddTicks(-1)));
        Assert.Equal(new[] { 3, 5, 2, 1 }, period.Itens.Select(p => p.ClienteId));

        var client = await Get<PaginaDto<PedidoDto>>("/api/pedidos?clienteId=1&inicio=2026-01-01&fim=2027-01-01");
        Assert.Equal(1, client.TotalRegistros);
        Assert.Equal(1, Assert.Single(client.Itens).ClienteId);

        var page1 = await Get<PaginaDto<PedidoDto>>("/api/pedidos?pagina=1&tamanho=2");
        var page2 = await Get<PaginaDto<PedidoDto>>("/api/pedidos?pagina=2&tamanho=2");
        var page3 = await Get<PaginaDto<PedidoDto>>("/api/pedidos?pagina=3&tamanho=2");
        var all = page1.Itens.Concat(page2.Itens).Concat(page3.Itens).ToList();
        Assert.Equal(6, page1.TotalRegistros);
        Assert.Equal(3, page1.TotalPaginas);
        Assert.Equal(2, page2.Pagina);
        Assert.Equal(6, all.Select(p => p.Id).Distinct().Count());
        Assert.Equal(all.OrderByDescending(p => p.DataPedido).ThenByDescending(p => p.Id).Select(p => p.Id), all.Select(p => p.Id));
        Assert.Empty((await Get<PaginaDto<PedidoDto>>("/api/pedidos?pagina=4&tamanho=2")).Itens);
        Assert.Empty((await Get<PaginaDto<PedidoDto>>("/api/pedidos?clienteId=6")).Itens);
    }

    [Fact]
    public async Task RankingLimitaOrdenaESeparaHomonimosNoPeriodo()
    {
        var all = await Get<List<RankingDto>>("/api/relatorios/top-clientes");
        Assert.Equal(new[] { 5, 4, 3, 1, 2 }, all.Select(c => c.ClienteId));
        Assert.Equal(new[] { 749.50m, 599.60m, 449.70m, 299.80m, 299.80m }, all.Select(c => c.Total));
        var period = await Get<List<RankingDto>>("/api/relatorios/top-clientes?inicio=2026-01-01&fim=2027-01-01");
        Assert.Equal(new[] { 5, 3, 2, 1 }, period.Select(c => c.ClienteId));
        Assert.Equal(new[] { 749.50m, 449.70m, 299.80m, 149.90m }, period.Select(c => c.Total));
    }

    [Theory]
    [InlineData("/api/pedidos?pagina=0", 400)]
    [InlineData("/api/pedidos?tamanho=101", 400)]
    [InlineData("/api/pedidos?clienteId=0", 400)]
    [InlineData("/api/pedidos?inicio=13-11-2026", 400)]
    [InlineData("/api/pedidos?inicio=2027-01-01&fim=2026-01-01", 400)]
    [InlineData("/api/relatorios/top-clientes?inicio=2026-01-01&fim=2026-01-01", 400)]
    [InlineData("/api/pedidos/999999999", 404)]
    public async Task ConsultaInvalidaRetornaProblemDetails(string path, int status)
    {
        using var response = await http.GetAsync(path);
        await Problem(response, (HttpStatusCode)status);
    }
}
