import type { CriarPedido, LinhaFormulario, Produto } from '../types/pedidos.ts';

export function calcularTotalEstimado(linhas: LinhaFormulario[], produtos: Produto[]): number {
  const centavos = linhas.reduce((total, linha) => {
    const produto = produtos.find(item => item.id === Number(linha.produtoId));
    const quantidade = Number(linha.quantidade);

    if (!produto || !Number.isInteger(quantidade) || quantidade <= 0) {
      return total;
    }

    return total + Math.round(produto.preco * 100) * quantidade;
  }, 0);

  return centavos / 100;
}

export function temProdutosRepetidos(linhas: LinhaFormulario[]): boolean {
  return new Set(linhas.map(linha => linha.produtoId)).size !== linhas.length;
}

export function montarPedido(clienteId: string, linhas: LinhaFormulario[]): CriarPedido {
  return {
    clienteId: Number(clienteId),
    itens: linhas.map(linha => ({
      produtoId: Number(linha.produtoId),
      quantidade: Number(linha.quantidade),
    })),
  };
}
