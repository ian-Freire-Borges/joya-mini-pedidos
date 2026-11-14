using Microsoft.EntityFrameworkCore;

namespace Pedidos.Api;

public static class PedidosEndpoints
{
    public static IEndpointRouteBuilder MapPedidosEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/pedidos/{id:long}", async (long id, PedidosService service, CancellationToken ct) => await service.Obter(id, ct) is { } pedido ? Results.Ok(pedido) : Results.Problem(statusCode: 404, title: "Pedido não encontrado"));
        endpoints.MapPost("/pedidos", async (CriarPedido entrada, PedidosService service, HttpRequest request, CancellationToken ct) => { var p = await service.Criar(entrada, ct); return Results.Created($"{request.PathBase}/pedidos/{p.Id}", p); });
        endpoints.MapGet("/pedidos", async (PedidosService service, CancellationToken ct, int? clienteId = null, string? inicio = null, string? fim = null, int pagina = 1, int tamanho = 10) => await service.Listar(clienteId, RegrasPedido.LerData(inicio), RegrasPedido.LerData(fim), pagina, tamanho, ct));
        return endpoints;
    }
}
