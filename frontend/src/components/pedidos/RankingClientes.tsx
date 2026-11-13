import type { ClienteRanking } from '../../types/pedidos';
import { reais } from '../../utils/formatacao';

interface RankingClientesProps {
  clientes: ClienteRanking[];
  carregando: boolean;
  temErro: boolean;
}

export function RankingClientes({ clientes, carregando, temErro }: RankingClientesProps) {
  return (
    <section className="card ranking" aria-labelledby="ranking-titulo">
      <div className="section-heading">
        <div>
          <div className="eyebrow">QUEM MAIS COMPRA</div>
          <h2 id="ranking-titulo">Top 5 clientes</h2>
        </div>
        <span className="muted small">Período dos filtros · todos os clientes</span>
      </div>
      {carregando ? (
        <p className="muted">Consultando ranking…</p>
      ) : temErro ? (
        <p className="muted">Ranking indisponível nesta consulta.</p>
      ) : !clientes.length ? (
        <p className="muted">Sem compras no período selecionado.</p>
      ) : (
        <ol className="ranking-list">
          {clientes.map((cliente, indice) => (
            <li key={cliente.clienteId}>
              <span className="rank-number">{String(indice + 1).padStart(2, '0')}</span>
              <span>{cliente.nome}<small>Cliente #{cliente.clienteId}</small></span>
              <strong>{reais(cliente.total)}</strong>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
