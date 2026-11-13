import { useFormularioPedido } from '../../hooks/useFormularioPedido';
import type { Cliente, Pedido, Produto } from '../../types/pedidos';
import { reais } from '../../utils/formatacao';
import { Alerta } from '../common/Alerta';
import { ItemPedidoForm } from './ItemPedidoForm';

interface FormularioPedidoProps {
  clientes: Cliente[];
  produtos: Produto[];
  onCreated: (pedido: Pedido) => void;
}

export function FormularioPedido({ clientes, produtos, onCreated }: FormularioPedidoProps) {
  const formulario = useFormularioPedido(produtos, onCreated);

  return (
    <section className="card create" aria-labelledby="novo-titulo">
      <div className="eyebrow">VENDA COM CONTROLE</div>
      <h2 id="novo-titulo">Novo pedido</h2>
      <p className="muted">Escolha o cliente e adicione os produtos.</p>
      <form onSubmit={event => { event.preventDefault(); void formulario.enviar(); }}>
        <fieldset disabled={formulario.enviando || !clientes.length || !produtos.length}>
          <label htmlFor="novo-cliente">Cliente</label>
          <select
              id="novo-cliente" required value={formulario.cliente}
              onChange={event => formulario.setCliente(event.target.value)}
          >
            <option value="">Selecione um cliente</option>
            {clientes.map(cliente => (
              <option key={cliente.id} value={cliente.id}>{cliente.nome} · #{cliente.id}</option>
            ))}
          </select>
          <div className="items-heading">
            <h3>Produtos</h3>
            <span>{formulario.linhas.length}/100 itens</span>
          </div>
          {formulario.linhas.map((linha, indice) => (
            <ItemPedidoForm
                key={linha.key} linha={linha} indice={indice}
                linhas={formulario.linhas} produtos={produtos}
                onMudar={formulario.mudarItem} onRemover={formulario.removerItem}
            />
          ))}
          <button
              className="secondary full" type="button" disabled={formulario.linhas.length >= 100}
              onClick={formulario.adicionarItem}
          >
            ＋ Adicionar produto
          </button>
          <div className="total">
            <span>Total estimado</span>
            <strong>{reais(formulario.totalEstimado)}</strong>
          </div>
          <p className="fine">O estoque e o preço são confirmados ao criar o pedido.</p>
          <button className="primary full" type="submit">
            {formulario.enviando ? 'Criando pedido…' : 'Criar pedido'}
          </button>
        </fieldset>
        {formulario.erro && <Alerta>{formulario.erro}</Alerta>}
      </form>
    </section>
  );
}
