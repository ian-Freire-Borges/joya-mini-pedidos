using Pedidos.Api;
using Xunit;

namespace UnitTests;

public class RegrasTests
{
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
