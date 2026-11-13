import { useRef, useState } from 'react';
import { criarPedido } from '../services/pedidosService';
import type { LinhaFormulario, Pedido, Produto } from '../types/pedidos';
import {
  calcularTotalEstimado,
  montarPedido,
  temProdutosRepetidos,
} from '../utils/formularioPedido';

export function useFormularioPedido(produtos: Produto[], onCreated: (pedido: Pedido) => void) {
  const [cliente, setCliente] = useState('');
  const [linhas, setLinhas] = useState<LinhaFormulario[]>([
    { key: 1, produtoId: '', quantidade: '1' },
  ]);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const proximaChave = useRef(2);
  const envioEmAndamento = useRef(false);

  function mudarItem(key: number, campo: 'produtoId' | 'quantidade', valor: string) {
    setLinhas(atuais => atuais.map(linha => (
      linha.key === key ? { ...linha, [campo]: valor } : linha
    )));
  }

  function adicionarItem() {
    const novaLinha = { key: proximaChave.current++, produtoId: '', quantidade: '1' };
    setLinhas(atuais => [...atuais, novaLinha]);
  }

  function removerItem(key: number) {
    setLinhas(atuais => atuais.filter(linha => linha.key !== key));
  }

  async function enviar() {
    if (envioEmAndamento.current) return;
    setErro('');

    if (temProdutosRepetidos(linhas)) {
      setErro('Selecione produtos diferentes em cada item.');
      return;
    }

    envioEmAndamento.current = true;
    setEnviando(true);

    try {
      const pedido = await criarPedido(montarPedido(cliente, linhas));
      setCliente('');
      setLinhas([{ key: proximaChave.current++, produtoId: '', quantidade: '1' }]);
      onCreated(pedido);
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Falha ao criar pedido.');
    } finally {
      envioEmAndamento.current = false;
      setEnviando(false);
    }
  }

  return {
    cliente, setCliente, linhas, enviando, erro,
    totalEstimado: calcularTotalEstimado(linhas, produtos),
    mudarItem, adicionarItem, removerItem, enviar,
  };
}
