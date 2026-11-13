import { useEffect, useState } from 'react';
import { consultarCatalogo } from '../services/catalogoService';
import type { Cliente, Produto } from '../types/pedidos';

export function useCatalogo(revisao: number) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [erro, setErro] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setErro('');

    consultarCatalogo(controller.signal)
      .then(catalogo => {
        if (!controller.signal.aborted) {
          setClientes(catalogo.clientes);
          setProdutos(catalogo.produtos);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setErro('Não foi possível carregar clientes e produtos. Tente atualizar.');
        }
      });

    return () => controller.abort();
  }, [revisao]);

  return { clientes, produtos, erro };
}
