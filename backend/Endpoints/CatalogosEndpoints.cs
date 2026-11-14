using Microsoft.EntityFrameworkCore;

namespace Pedidos.Api;

public static class CatalogosEndpoints
{
    public static IEndpointRouteBuilder MapCatalogosEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/clientes", async (PedidosDb db, CancellationToken ct) => await db.Clientes.AsNoTracking().OrderBy(x => x.Nome).ThenBy(x => x.Id).ToListAsync(ct));
        endpoints.MapGet("/produtos", async (PedidosDb db, CancellationToken ct) => await db.Produtos.AsNoTracking().OrderBy(x => x.Nome).ThenBy(x => x.Id).ToListAsync(ct));
        return endpoints;
    }
}
