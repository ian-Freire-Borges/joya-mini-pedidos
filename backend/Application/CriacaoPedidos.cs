using Microsoft.EntityFrameworkCore;

namespace Pedidos.Api;

public sealed class CriacaoPedidos(
    PedidosDb db,
    TimeProvider clock,
    EstoquePedidos estoque,
    PedidosConsultas consultas,
    ILogger<CriacaoPedidos> logger)
{
    public async Task<PedidoDto> Criar(CriarPedido entrada, CancellationToken ct)
    {
        RegrasPedido.Validar(entrada);
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        var cliente = RegrasPedido.ExigirCliente(
            await db.Clientes.AsNoTracking().SingleOrDefaultAsync(x => x.Id == entrada.ClienteId, ct));
        var pedido = new Pedido
        {
            ClienteId = cliente.Id,
            DataPedido = clock.GetUtcNow().UtcDateTime
        };

        // Uma única transação inclui cada baixa, o pedido e todos os seus itens.
        // Dispose sem commit desfaz as baixas anteriores se qualquer item falhar.
        foreach (var item in entrada.Itens!.OrderBy(x => x.ProdutoId))
        {
            var preco = await estoque.Baixar(item.ProdutoId, item.Quantidade, tx, ct);
            pedido.Itens.Add(new ItemPedido
            {
                ProdutoId = item.ProdutoId,
                Quantidade = item.Quantidade,
                PrecoUnitario = preco
            });
        }

        db.Pedidos.Add(pedido);
        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);
        logger.LogInformation("Pedido {PedidoId} criado para cliente {ClienteId} com {Itens} itens",
            pedido.Id, pedido.ClienteId, pedido.Itens.Count);
        return (await consultas.Obter(pedido.Id, ct))!;
    }
}
