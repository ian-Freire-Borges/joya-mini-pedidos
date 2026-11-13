import type { Pedido } from '../../types/pedidos';
import { dataUtc, reais } from '../../utils/formatacao';
import { Alerta } from '../common/Alerta';

interface TabelaPedidosProps {
  pedidos: Pedido[];
  carregando: boolean;
  erro: string;
}

export function TabelaPedidos({ pedidos, carregando, erro }: TabelaPedidosProps) {
  if (carregando) return <div className="empty">Carregando pedidos…</div>;
  if (erro) return <Alerta>{erro}</Alerta>;
  if (!pedidos.length) {
    return (
      <div className="empty">
        <strong>Nenhum pedido por aqui.</strong>
        <p>Crie um pedido ou ajuste os filtros.</p>
      </div>
    );
  }

  return (
    <div className="table-scroll">
      <table>
        <caption className="sr-only">Pedidos em ordem do mais recente. Datas em UTC.</caption>
        <thead>
          <tr>
            <th>Pedido / cliente</th>
            <th>Data · UTC</th>
            <th>Produtos</th>
            <th className="number">Total</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map(pedido => (
            <tr key={pedido.id}>
              <td>
                <strong>#{pedido.id}</strong>
                <span className="cell-sub">{pedido.clienteNome} · cliente #{pedido.clienteId}</span>
              </td>
              <td>{dataUtc(pedido.dataPedido)}</td>
              <td>
                <details>
                  <summary>{pedido.itens.length} {pedido.itens.length === 1 ? 'produto' : 'produtos'}</summary>
                  <ul className="detail-items">
                    {pedido.itens.map(item => (
                      <li key={item.produtoId}>
                        {item.quantidade} × {item.produtoNome}
                        <span>{reais(item.precoUnitario)} / un. · {reais(item.subtotal)}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              </td>
              <td className="number amount">{reais(pedido.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
