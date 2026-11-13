import type {
  ClienteRanking,
  CriarPedido,
  FiltrosPedidos,
  PaginaPedidos,
  Pedido,
} from '../types/pedidos.ts';
import { queryPedidos, queryPeriodo } from '../utils/filtros.ts';
import { requisitar } from './http.ts';

export async function consultarPainel(
  filtros: FiltrosPedidos,
  pagina: number,
  signal: AbortSignal,
) {
  const [pedidos, ranking] = await Promise.all([
    requisitar<PaginaPedidos>(`/pedidos?${queryPedidos(filtros, pagina)}`, { signal }),
    requisitar<ClienteRanking[]>(`/relatorios/top-clientes?${queryPeriodo(filtros)}`, { signal }),
  ]);

  return { pedidos, ranking };
}

export function criarPedido(entrada: CriarPedido): Promise<Pedido> {
  return requisitar<Pedido>('/pedidos', {
    method: 'POST',
    body: JSON.stringify(entrada),
  });
}
