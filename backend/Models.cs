namespace Pedidos.Api;

public sealed class Cliente { public int Id { get; set; } public string Nome { get; set; } = ""; }
public sealed class Produto { public int Id { get; set; } public string Nome { get; set; } = ""; public decimal Preco { get; set; } public int Estoque { get; set; } }
public sealed class Pedido
{
    public long Id { get; set; }
    public int ClienteId { get; set; }
    public Cliente Cliente { get; set; } = null!;
    public DateTime DataPedido { get; set; }
    public List<ItemPedido> Itens { get; set; } = [];
}
public sealed class ItemPedido
{
    public long PedidoId { get; set; }
    public int ProdutoId { get; set; }
    public Produto Produto { get; set; } = null!;
    public int Quantidade { get; set; }
    public decimal PrecoUnitario { get; set; }
}
public sealed record CriarItem(int ProdutoId, int Quantidade);
public sealed record CriarPedido(int ClienteId, List<CriarItem>? Itens);
public sealed record ItemDto(int ProdutoId, string ProdutoNome, int Quantidade, decimal PrecoUnitario)
{ public decimal Subtotal => Quantidade * PrecoUnitario; }
public sealed record PedidoDto(long Id, int ClienteId, string ClienteNome, DateTime DataPedido, List<ItemDto> Itens)
{ public decimal Total => Itens.Sum(i => i.Subtotal); }
public sealed record PaginaDto<T>(List<T> Itens, int Pagina, int Tamanho, int TotalRegistros)
{ public int TotalPaginas => (int)Math.Ceiling((decimal)TotalRegistros / Tamanho); }
public sealed record RankingDto(int ClienteId, string Nome, decimal Total);
public sealed class RegraException(int status, string message) : Exception(message) { public int Status => status; }

public static class RegrasPedido
{
    public static Cliente ExigirCliente(Cliente? cliente) =>
        cliente ?? throw new RegraException(404, "Cliente não encontrado.");

    // A baixa condicional retorna o preço apenas quando há saldo suficiente.
    // A consulta de existência distingue produto ausente de conflito de estoque.
    public static decimal ConfirmarBaixaEstoque(decimal? precoRetornado, bool produtoExiste)
    {
        if (!produtoExiste) throw new RegraException(404, "Produto não encontrado.");
        return precoRetornado ?? throw new RegraException(409, "Estoque insuficiente. Atualize os produtos e tente novamente.");
    }

    public static void Validar(CriarPedido? pedido)
    {
        if (pedido is null) throw new RegraException(400, "Informe os dados do pedido.");
        if (pedido.ClienteId <= 0) throw new RegraException(400, "Selecione um cliente válido.");
        if (pedido.Itens is null || pedido.Itens.Count is < 1 or > 100) throw new RegraException(400, "Informe entre 1 e 100 itens.");
        if (pedido.Itens.Any(i => i is null || i.ProdutoId <= 0 || i.Quantidade is < 1 or > 10000))
            throw new RegraException(400, "Cada item deve ter produto válido e quantidade entre 1 e 10.000.");
        if (pedido.Itens.Select(i => i.ProdutoId).Distinct().Count() != pedido.Itens.Count)
            throw new RegraException(400, "Produtos repetidos não são permitidos.");
    }
    public static void ValidarPeriodo(DateOnly? inicio, DateOnly? fim)
    {
        if (inicio.HasValue && fim.HasValue && inicio >= fim) throw new RegraException(400, "A data inicial deve ser anterior à data final exclusiva.");
    }
    public static DateTime Utc(DateOnly dia) => DateTime.SpecifyKind(dia.ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc);
    public static DateOnly? LerData(string? texto)
    {
        if (texto is null) return null;
        if (!DateOnly.TryParseExact(texto, "yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture,
                System.Globalization.DateTimeStyles.None, out var dia))
            throw new RegraException(400, "Informe datas no formato yyyy-MM-dd.");
        return dia;
    }
}
