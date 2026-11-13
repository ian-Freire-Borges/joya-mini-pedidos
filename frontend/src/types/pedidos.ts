export interface Cliente {
  id: number;
  nome: string;
}

export interface Produto {
  id: number;
  nome: string;
  preco: number;
  estoque: number;
}

export interface ItemPedido {
  produtoId: number;
  produtoNome: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

export interface Pedido {
  id: number;
  clienteId: number;
  clienteNome: string;
  dataPedido: string;
  itens: ItemPedido[];
  total: number;
}

export interface PaginaPedidos {
  itens: Pedido[];
  pagina: number;
  tamanho: number;
  totalRegistros: number;
  totalPaginas: number;
}

export interface ClienteRanking {
  clienteId: number;
  nome: string;
  total: number;
}

export interface FiltrosPedidos {
  clienteId: string;
  inicio: string;
  fim: string;
}

export interface CriarPedido {
  clienteId: number;
  itens: Array<{ produtoId: number; quantidade: number }>;
}

export interface LinhaFormulario {
  key: number;
  produtoId: string;
  quantidade: string;
}
