import type { LinhaFormulario, Produto } from '../../types/pedidos';
import { reais } from '../../utils/formatacao';

interface ItemPedidoFormProps {
  linha: LinhaFormulario;
  indice: number;
  linhas: LinhaFormulario[];
  produtos: Produto[];
  onMudar: (key: number, campo: 'produtoId' | 'quantidade', valor: string) => void;
  onRemover: (key: number) => void;
}

export function ItemPedidoForm({ linha, indice, linhas, produtos, onMudar, onRemover }: ItemPedidoFormProps) {
  const produto = produtos.find(item => item.id === Number(linha.produtoId));

  return (
    <div className="order-item">
      <label htmlFor={`produto-${linha.key}`}>Produto {indice + 1}</label>
      <select
          id={`produto-${linha.key}`} required value={linha.produtoId}
          onChange={event => onMudar(linha.key, 'produtoId', event.target.value)}
      >
        <option value="">Selecione um produto</option>
        {produtos.map(item => (
          <option
              key={item.id} value={item.id}
              disabled={linhas.some(outra => outra.key !== linha.key && Number(outra.produtoId) === item.id)}
          >
            {item.nome} · {reais(item.preco)}
          </option>
        ))}
      </select>
      <div className="quantity-row">
        <div>
          <label htmlFor={`qtd-${linha.key}`}>Quantidade</label>
          <input
              id={`qtd-${linha.key}`} type="number" min="1" max="10000" step="1" required
              value={linha.quantidade}
              onChange={event => onMudar(linha.key, 'quantidade', event.target.value)}
          />
        </div>
        <button
            className="text-button" type="button" disabled={linhas.length === 1}
            onClick={() => onRemover(linha.key)} aria-label={`Remover produto ${indice + 1}`}
        >
          Remover
        </button>
      </div>
      <small>
        {produto
          ? `${produto.estoque} unidades disponíveis na última consulta`
          : 'O preço será confirmado pelo servidor.'}
      </small>
    </div>
  );
}
