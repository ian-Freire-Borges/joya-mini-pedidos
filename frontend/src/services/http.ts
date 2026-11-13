const API_BASE = '/api';

/** Transporte HTTP. Não conhece componentes, filtros ou regras do formulário. */
export async function requisitar<T>(caminho: string, opcoes: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${caminho}`, {
    ...opcoes,
    headers: {
      'Content-Type': 'application/json',
      ...opcoes.headers,
    },
    signal: opcoes.signal ?? AbortSignal.timeout(20000),
  });

  if (!response.ok) {
    const problem = await response.json().catch(() => null);
    throw new Error(
      problem?.detail || problem?.title ||
      `Não foi possível concluir a solicitação (${response.status}).`,
    );
  }

  return response.json();
}
