import type { Cliente, FiltrosPedidos as Filtros } from '../../types/pedidos';

interface FiltrosPedidosProps {
  clientes: Cliente[];
  valores: Filtros;
  onMudar: (filtros: Filtros) => void;
  onAplicar: () => void;
  onLimpar: () => void;
}

export function FiltrosPedidos({ clientes, valores, onMudar, onAplicar, onLimpar }: FiltrosPedidosProps) {
  return (
    <form className="filters" onSubmit={event => { event.preventDefault(); onAplicar(); }}>
      <div>
        <label htmlFor="filtro-cliente">Cliente</label>
        <select
          id="filtro-cliente"
          value={valores.clienteId}
          onChange={event => onMudar({ ...valores, clienteId: event.target.value })}
        >
          <option value="">Todos os clientes</option>
          {clientes.map(cliente => (
            <option key={cliente.id} value={cliente.id}>{cliente.nome} · #{cliente.id}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="inicio">De</label>
        <input
          id="inicio" type="date" min="0001-01-01" max="9998-12-31"
          value={valores.inicio}
          onChange={event => onMudar({ ...valores, inicio: event.target.value })}
        />
      </div>
      <div>
        <label htmlFor="fim">Até</label>
        <input
          id="fim" type="date" min="0001-01-01" max="9998-12-31"
          value={valores.fim}
          onChange={event => onMudar({ ...valores, fim: event.target.value })}
        />
      </div>
      <button type="submit" className="primary">Filtrar</button>
      <button type="button" className="text-button" onClick={onLimpar}>Limpar</button>
    </form>
  );
}
