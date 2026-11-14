using System.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace Pedidos.Api;

public sealed class EstoquePedidos(PedidosDb db)
{
    public async Task<decimal> Baixar(int produtoId, int quantidade, IDbContextTransaction tx, CancellationToken ct)
    {
        // O predicado é reavaliado após aguardar locks concorrentes.
        // OUTPUT captura o preço da mesma atualização, na transação do pedido.
        await using var cmd = db.Database.GetDbConnection().CreateCommand();
        cmd.Transaction = tx.GetDbTransaction();
        cmd.CommandText = "UPDATE dbo.Produtos SET Estoque = Estoque - @q OUTPUT INSERTED.Preco WHERE Id = @id AND Estoque >= @q;";

        var q = cmd.CreateParameter();
        q.ParameterName = "@q";
        q.DbType = DbType.Int32;
        q.Value = quantidade;
        cmd.Parameters.Add(q);

        var id = cmd.CreateParameter();
        id.ParameterName = "@id";
        id.DbType = DbType.Int32;
        id.Value = produtoId;
        cmd.Parameters.Add(id);

        var resultado = await cmd.ExecuteScalarAsync(ct);
        decimal? precoRetornado = resultado is null || resultado == DBNull.Value ? null : (decimal)resultado;
        var produtoExiste = precoRetornado.HasValue ||
            await db.Produtos.AsNoTracking().AnyAsync(x => x.Id == produtoId, ct);
        return RegrasPedido.ConfirmarBaixaEstoque(precoRetornado, produtoExiste);
    }
}
