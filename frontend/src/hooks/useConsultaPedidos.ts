import { useEffect, useState } from 'react';
import { consultarPainel } from '../services/pedidosService';
import type { ClienteRanking, FiltrosPedidos, PaginaPedidos } from '../types/pedidos';

export function useConsultaPedidos(filtros: FiltrosPedidos, pagina: number, revisao: number) {
  const [dados, setDados] = useState<PaginaPedidos>();
  const [ranking, setRanking] = useState<ClienteRanking[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    let ativa = true;
    setCarregando(true);
    setErro('');

    consultarPainel(filtros, pagina, controller.signal)
      .then(painel => {
        if (ativa) {
          setDados(painel.pedidos);
          setRanking(painel.ranking);
        }
      })
      .catch(error => {
        if (ativa) {
          setErro(error instanceof Error ? error.message : 'Falha ao consultar pedidos.');
        }
      })
      .finally(() => {
        if (ativa) setCarregando(false);
      });

    return () => {
      ativa = false;
      controller.abort();
    };
  }, [filtros, pagina, revisao]);

  return { dados, ranking, carregando, erro };
}
