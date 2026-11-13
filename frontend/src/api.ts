export type Cliente = { id: number; nome: string };
export type Produto = { id: number; nome: string; preco: number; estoque: number };
export type Item = { produtoId: number; produtoNome: string; quantidade: number; precoUnitario: number; subtotal: number };
export type Pedido = { id: number; clienteId: number; clienteNome: string; dataPedido: string; itens: Item[]; total: number };
export type Pagina = { itens: Pedido[]; pagina: number; tamanho: number; totalRegistros: number; totalPaginas: number };
export type Ranking = { clienteId: number; nome: string; total: number };
export type Filtros = { clienteId: string; inicio: string; fim: string };

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
    signal: options.signal ?? AbortSignal.timeout(20000),
  });
  if (!response.ok) {
    const problem = await response.json().catch(() => null);
    throw new Error(problem?.detail || problem?.title || `Não foi possível concluir a solicitação (${response.status}).`);
  }
  return response.json();
}

export const reais = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export const dataUtc = (value: string) => new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'UTC' }).format(new Date(value));
export function queryPeriodo(filtros: Filtros): URLSearchParams {
  const query = new URLSearchParams();
  if (filtros.inicio) query.set('inicio', filtros.inicio);
  if (filtros.fim) {
    const fim = new Date(`${filtros.fim}T00:00:00Z`);
    fim.setUTCDate(fim.getUTCDate() + 1);
    query.set('fim', fim.toISOString().slice(0, 10));
  }
  return query;
}
