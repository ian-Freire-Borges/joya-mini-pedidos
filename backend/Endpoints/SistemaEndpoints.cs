using Microsoft.EntityFrameworkCore;

namespace Pedidos.Api;

public static class SistemaEndpoints
{
    public static IEndpointRouteBuilder MapSistemaEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/health", async (PedidosDb db, CancellationToken ct) => await db.Database.CanConnectAsync(ct) ? Results.Ok(new { status = "ok" }) : Results.StatusCode(503));
        return endpoints;
    }
}
