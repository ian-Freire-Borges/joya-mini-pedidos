import type { FiltrosPedidos } from '../types/pedidos.ts';

export const FILTROS_VAZIOS: FiltrosPedidos = {
  clienteId: '',
  inicio: '',
  fim: '',
};

export function queryPeriodo(filtros: FiltrosPedidos): URLSearchParams {
  const query = new URLSearchParams();

  if (filtros.inicio) {
    query.set('inicio', filtros.inicio);
  }

  if (filtros.fim) {
    const fim = new Date(`${filtros.fim}T00:00:00Z`);
    fim.setUTCDate(fim.getUTCDate() + 1);
    query.set('fim', fim.toISOString().slice(0, 10));
  }

  return query;
}

export function queryPedidos(filtros: FiltrosPedidos, pagina: number): URLSearchParams {
  const query = queryPeriodo(filtros);

  if (filtros.clienteId) {
    query.set('clienteId', filtros.clienteId);
  }

  query.set('pagina', String(pagina));
  query.set('tamanho', '10');
  return query;
}
