using Microsoft.EntityFrameworkCore;

namespace Pedidos.Api;

public static class RelatoriosEndpoints
{
    public static IEndpointRouteBuilder MapRelatoriosEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/relatorios/top-clientes", async (PedidosConsultas service, CancellationToken ct, string? inicio = null, string? fim = null) => await service.Ranking(RegrasPedido.LerData(inicio), RegrasPedido.LerData(fim), ct));
        return endpoints;
    }
}
