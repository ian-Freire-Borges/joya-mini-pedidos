import type { Cliente, Produto } from '../types/pedidos.ts';
import { requisitar } from './http.ts';

export async function consultarCatalogo(signal: AbortSignal) {
  const [clientes, produtos] = await Promise.all([
    requisitar<Cliente[]>('/clientes', { signal }),
    requisitar<Produto[]>('/produtos', { signal }),
  ]);

  return { clientes, produtos };
}
