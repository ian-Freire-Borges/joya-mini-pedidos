using Pedidos.Api;
using Xunit;

namespace UnitTests;

public class RegrasTests
{
    [Fact]
    public void ClienteInexistenteRetornaNaoEncontrado()
    {
        var erro = Assert.Throws<RegraException>(() => RegrasPedido.ExigirCliente(null));
        Assert.Equal(404, erro.Status);
        Assert.Equal("Cliente não encontrado.", erro.Message);
    }

    [Fact]
    public void ClienteExistenteMantemIdentidadeDoPedido()
    {
        var cliente = new Cliente { Id = 2, Nome = "Ana Silva" };
        Assert.Same(cliente, RegrasPedido.ExigirCliente(cliente));
    }

    [Fact]
    public void ProdutoExistenteSemBaixaRetornaEstoqueInsuficiente()
    {
        var erro = Assert.Throws<RegraException>(() => RegrasPedido.ConfirmarBaixaEstoque(null, true));
        Assert.Equal(409, erro.Status);
        Assert.Contains("Estoque insuficiente", erro.Message);
    }

    [Fact]
    public void ProdutoInexistenteNaoEhConfundidoComFaltaDeEstoque()
    {
        var erro = Assert.Throws<RegraException>(() => RegrasPedido.ConfirmarBaixaEstoque(null, false));
        Assert.Equal(404, erro.Status);
        Assert.Equal("Produto não encontrado.", erro.Message);
    }

    [Theory]
    [InlineData("0.01")]
    [InlineData("149.90")]
    [InlineData("999999.99")]
    public void BaixaConfirmadaPreservaPrecoDecimalDoServidor(string valor)
    {
        var preco = decimal.Parse(valor, System.Globalization.CultureInfo.InvariantCulture);
        Assert.Equal(preco, RegrasPedido.ConfirmarBaixaEstoque(preco, true));
    }

    [Theory]
    [InlineData(-1)] [InlineData(0)] [InlineData(10001)]
    public void RejeitaQuantidadeForaDoContrato(int quantidade)
    {
        var erro = Assert.Throws<RegraException>(() => RegrasPedido.Validar(new(1, [new(1, quantidade)])));
        Assert.Equal(400, erro.Status);
    }

    [Fact]
    public void RejeitaDuplicatasSemSomarQuantidades()
    {
        Assert.Throws<RegraException>(() => RegrasPedido.Validar(new(1, [new(1, 1), new(1, 2)])));
    }

    [Fact]
    public void RejeitaAusenciasEIdentificadoresInvalidos()
    {
        CriarPedido?[] pedidos = [null, new(1, null), new(1, []), new(0, [new(1, 1)]), new(1, [new(0, 1)]), new(1, [null!])];
        foreach (var pedido in pedidos)
            Assert.Equal(400, Assert.Throws<RegraException>(() => RegrasPedido.Validar(pedido)).Status);
    }

    [Fact]
    public void AceitaLimitesERejeitaMaisDeCemProdutos()
    {
        RegrasPedido.Validar(new(1, Enumerable.Range(1, 100).Select(id => new CriarItem(id, 10000)).ToList()));
        Assert.Throws<RegraException>(() => RegrasPedido.Validar(new(1, Enumerable.Range(1, 101).Select(id => new CriarItem(id, 1)).ToList())));
    }

    [Fact]
    public void SomaDinheiroSemErroBinario()
    {
        var pedido = new PedidoDto(1, 1, "Ana", DateTime.UtcNow, [new(1, "A", 3, 0.10m), new(2, "B", 2, 19.99m)]);
        Assert.Equal(40.28m, pedido.Total);
    }

    [Theory]
    [InlineData("13/11/2026")] [InlineData("2026-2-01")] [InlineData("")] [InlineData("2026-02-30")]
    public void DatasExigemIsoValido(string data) => Assert.Throws<RegraException>(() => RegrasPedido.LerData(data));

    [Fact]
    public void PeriodoEhUtcComFimExclusivo()
    {
        var data = RegrasPedido.LerData("2026-11-13")!.Value;
        Assert.Equal(DateTimeKind.Utc, RegrasPedido.Utc(data).Kind);
        Assert.Null(RegrasPedido.LerData(null));
        Assert.Throws<RegraException>(() => RegrasPedido.ValidarPeriodo(data, data));
        Assert.Throws<RegraException>(() => RegrasPedido.ValidarPeriodo(data.AddDays(1), data));
        RegrasPedido.ValidarPeriodo(data, data.AddDays(1));
    }
}
