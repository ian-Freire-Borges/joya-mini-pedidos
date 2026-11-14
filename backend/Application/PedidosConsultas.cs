using Microsoft.EntityFrameworkCore;

namespace Pedidos.Api;

public sealed class PedidosConsultas(PedidosDb db)
{
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
        return await ConsultarRanking(Filtrar(null, inicio, fim)).ToListAsync(ct);
    }

    // Ordenar agregados escalares antes de construir o record permite tradução SQL.
    // GroupBy, SUM, ORDER BY e TOP continuam no servidor; não materializar antes do Take.
    internal static IQueryable<RankingDto> ConsultarRanking(IQueryable<Pedido> pedidos)
    {
        return pedidos
            .SelectMany(pedido => pedido.Itens.Select(item => new
            {
                pedido.ClienteId,
                pedido.Cliente.Nome,
                Valor = item.PrecoUnitario * item.Quantidade
            }))
            .GroupBy(item => new { item.ClienteId, item.Nome })
            .Select(grupo => new
            {
                grupo.Key.ClienteId,
                grupo.Key.Nome,
                Total = grupo.Sum(item => item.Valor)
            })
            .OrderByDescending(cliente => cliente.Total)
            .ThenBy(cliente => cliente.ClienteId)
            .Take(5)
            .Select(cliente => new RankingDto(cliente.ClienteId, cliente.Nome, cliente.Total));
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
