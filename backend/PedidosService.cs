using System.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
namespace Pedidos.Api;

public sealed class PedidosService(PedidosDb db, TimeProvider clock, ILogger<PedidosService> logger)
{
    public async Task<PedidoDto> Criar(CriarPedido entrada, CancellationToken ct)
    {
        RegrasPedido.Validar(entrada);
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        var cliente = await db.Clientes.AsNoTracking().SingleOrDefaultAsync(x => x.Id == entrada.ClienteId, ct)
            ?? throw new RegraException(404, "Cliente não encontrado.");
        var pedido = new Pedido { ClienteId = cliente.Id, DataPedido = clock.GetUtcNow().UtcDateTime };
        foreach (var item in entrada.Itens!.OrderBy(x => x.ProdutoId))
        {
            // O predicado é reavaliado após aguardar locks concorrentes. OUTPUT captura o preço da mesma atualização.
            await using var cmd = db.Database.GetDbConnection().CreateCommand();
            cmd.Transaction = tx.GetDbTransaction();
            cmd.CommandText = "UPDATE dbo.Produtos SET Estoque = Estoque - @q OUTPUT INSERTED.Preco WHERE Id = @id AND Estoque >= @q;";
            var q = cmd.CreateParameter(); q.ParameterName = "@q"; q.DbType = DbType.Int32; q.Value = item.Quantidade; cmd.Parameters.Add(q);
            var id = cmd.CreateParameter(); id.ParameterName = "@id"; id.DbType = DbType.Int32; id.Value = item.ProdutoId; cmd.Parameters.Add(id);
            var preco = await cmd.ExecuteScalarAsync(ct);
            if (preco is null || preco == DBNull.Value)
            {
                if (!await db.Produtos.AsNoTracking().AnyAsync(x => x.Id == item.ProdutoId, ct)) throw new RegraException(404, "Produto não encontrado.");
                throw new RegraException(409, "Estoque insuficiente. Atualize os produtos e tente novamente.");
            }
            pedido.Itens.Add(new ItemPedido { ProdutoId = item.ProdutoId, Quantidade = item.Quantidade, PrecoUnitario = (decimal)preco });
        }
        db.Pedidos.Add(pedido);
        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);
        logger.LogInformation("Pedido {PedidoId} criado para cliente {ClienteId} com {Itens} itens", pedido.Id, pedido.ClienteId, pedido.Itens.Count);
        return (await Obter(pedido.Id, ct))!;
    }
    public async Task<PedidoDto?> Obter(long id, CancellationToken ct)
    {
        var pedido = await db.Pedidos.AsNoTracking().Include(x => x.Cliente).Include(x => x.Itens).ThenInclude(x => x.Produto).SingleOrDefaultAsync(x => x.Id == id, ct);
        return pedido is null ? null : Map(pedido);
    }
    public async Task<PaginaDto<PedidoDto>> Listar(int? clienteId, DateOnly? inicio, DateOnly? fim, int pagina, int tamanho, CancellationToken ct)
    {
        RegrasPedido.ValidarPeriodo(inicio, fim);
        if (pagina is < 1 or > 1000000 || tamanho is < 1 or > 100 || clienteId <= 0) throw new RegraException(400, "Paginação ou cliente inválido.");
        var query = Filtrar(clienteId, inicio, fim);
        var count = await query.CountAsync(ct);
        var pedidos = await query.OrderByDescending(x => x.DataPedido).ThenByDescending(x => x.Id).Skip((pagina - 1) * tamanho).Take(tamanho)
            .Include(x => x.Cliente).Include(x => x.Itens).ThenInclude(x => x.Produto).AsSplitQuery().ToListAsync(ct);
        return new(pedidos.Select(Map).ToList(), pagina, tamanho, count);
    }
    public async Task<List<RankingDto>> Ranking(DateOnly? inicio, DateOnly? fim, CancellationToken ct)
    {
        RegrasPedido.ValidarPeriodo(inicio, fim);
        return await Filtrar(null, inicio, fim).SelectMany(p => p.Itens.Select(i => new { p.ClienteId, p.Cliente.Nome, Valor = i.PrecoUnitario * i.Quantidade }))
            .GroupBy(x => new { x.ClienteId, x.Nome }).Select(g => new RankingDto(g.Key.ClienteId, g.Key.Nome, g.Sum(x => x.Valor)))
            .OrderByDescending(x => x.Total).ThenBy(x => x.ClienteId).Take(5).ToListAsync(ct);
    }
    private IQueryable<Pedido> Filtrar(int? clienteId, DateOnly? inicio, DateOnly? fim)
    {
        var query = db.Pedidos.AsNoTracking();
        if (clienteId.HasValue) query = query.Where(x => x.ClienteId == clienteId);
        if (inicio.HasValue) { var data = RegrasPedido.Utc(inicio.Value); query = query.Where(x => x.DataPedido >= data); }
        if (fim.HasValue) { var data = RegrasPedido.Utc(fim.Value); query = query.Where(x => x.DataPedido < data); }
        return query;
    }
    private static PedidoDto Map(Pedido p) => new(p.Id, p.ClienteId, p.Cliente.Nome, p.DataPedido,
        p.Itens.OrderBy(x => x.ProdutoId).Select(i => new ItemDto(i.ProdutoId, i.Produto.Nome, i.Quantidade, i.PrecoUnitario)).ToList());
}
