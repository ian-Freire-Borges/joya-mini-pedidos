using Microsoft.EntityFrameworkCore;
using Pedidos.Api;
using Xunit;

namespace UnitTests;

public class RankingTraducaoTests
{
    [Fact]
    public void RankingTraduzAgregacaoOrdenacaoELimiteParaSqlServer()
    {
        // Compila a consulta com o provider real, sem abrir conexão nem usar InMemory.
        var options = new DbContextOptionsBuilder<PedidosDb>()
            .UseSqlServer("Server=localhost;Database=SomenteTraducao;Integrated Security=True")
            .Options;
        using var db = new PedidosDb(options);

        var sql = PedidosConsultas.ConsultarRanking(db.Pedidos.AsNoTracking()).ToQueryString();

        Assert.Contains("SUM(", sql);
        Assert.Contains("GROUP BY", sql);
        Assert.Contains("ORDER BY", sql);
        Assert.Contains("DESC", sql);
        Assert.Contains("TOP(", sql);
    }

    [Fact]
    public void RankingMantemPeriodoComoPredicadoSql()
    {
        var options = new DbContextOptionsBuilder<PedidosDb>()
            .UseSqlServer("Server=localhost;Database=SomenteTraducao;Integrated Security=True")
            .Options;
        using var db = new PedidosDb(options);
        var inicio = RegrasPedido.Utc(new DateOnly(2026, 1, 1));
        var fim = RegrasPedido.Utc(new DateOnly(2027, 1, 1));
        var pedidos = db.Pedidos.Where(pedido => pedido.DataPedido >= inicio && pedido.DataPedido < fim);

        var sql = PedidosConsultas.ConsultarRanking(pedidos).ToQueryString();

        Assert.Contains("WHERE", sql);
        Assert.Contains("[DataPedido] >=", sql);
        Assert.Contains("[DataPedido] <", sql);
        Assert.Contains("GROUP BY", sql);
    }
}
