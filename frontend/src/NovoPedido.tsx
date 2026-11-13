import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { api, reais } from './api';
import type { Cliente, Pedido, Produto } from './api';

type Linha = { key: number; produtoId: string; quantidade: string };
export function NovoPedido({ clientes, produtos, onCreated }: { clientes: Cliente[]; produtos: Produto[]; onCreated: (pedido: Pedido) => void }) {
  const [cliente, setCliente] = useState('');
  const [linhas, setLinhas] = useState<Linha[]>([{ key: 1, produtoId: '', quantidade: '1' }]);
  const nextKey = useRef(2);
  const lock = useRef(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const totalCentavos = linhas.reduce((soma, linha) => {
    const produto = produtos.find(p => p.id === Number(linha.produtoId));
    const quantidade = Number(linha.quantidade);
    return soma + (produto && Number.isInteger(quantidade) && quantidade > 0 ? Math.round(produto.preco * 100) * quantidade : 0);
  }, 0);
  function mudar(key: number, campo: 'produtoId' | 'quantidade', valor: string) {
    setLinhas(antigas => antigas.map(linha => linha.key === key ? { ...linha, [campo]: valor } : linha));
  }
  async function enviar(event: FormEvent) {
    event.preventDefault();
    if (lock.current) return;
    setErro('');
    if (new Set(linhas.map(l => l.produtoId)).size !== linhas.length) { setErro('Selecione produtos diferentes em cada item.'); return; }
    lock.current = true; setEnviando(true);
    try {
      const pedido = await api<Pedido>('/pedidos', { method: 'POST', body: JSON.stringify({ clienteId: Number(cliente), itens: linhas.map(l => ({ produtoId: Number(l.produtoId), quantidade: Number(l.quantidade) })) }) });
      setCliente(''); setLinhas([{ key: nextKey.current++, produtoId: '', quantidade: '1' }]);
      onCreated(pedido);
    } catch (error) { setErro(error instanceof Error ? error.message : 'Falha ao criar pedido.'); }
    finally { lock.current = false; setEnviando(false); }
  }
  return <section className="card create" aria-labelledby="novo-titulo">
    <div className="eyebrow">VENDA COM CONTROLE</div><h2 id="novo-titulo">Novo pedido</h2><p className="muted">Escolha o cliente e adicione os produtos.</p>
    <form onSubmit={enviar}>
      <fieldset disabled={enviando || !clientes.length || !produtos.length}>
        <label htmlFor="novo-cliente">Cliente</label><select id="novo-cliente" required value={cliente} onChange={e => setCliente(e.target.value)}><option value="">Selecione um cliente</option>{clientes.map(c => <option key={c.id} value={c.id}>{c.nome} · #{c.id}</option>)}</select>
        <div className="items-heading"><h3>Produtos</h3><span>{linhas.length}/100 itens</span></div>
        {linhas.map((linha, index) => {
          const produto = produtos.find(p => p.id === Number(linha.produtoId));
          return <div className="order-item" key={linha.key}>
            <label htmlFor={`produto-${linha.key}`}>Produto {index + 1}</label>
            <select id={`produto-${linha.key}`} required value={linha.produtoId} onChange={e => mudar(linha.key, 'produtoId', e.target.value)}>
              <option value="">Selecione um produto</option>{produtos.map(p => <option key={p.id} value={p.id} disabled={linhas.some(l => l.key !== linha.key && Number(l.produtoId) === p.id)}>{p.nome} · {reais(p.preco)}</option>)}
            </select>
            <div className="quantity-row"><div><label htmlFor={`qtd-${linha.key}`}>Quantidade</label><input id={`qtd-${linha.key}`} type="number" min="1" max="10000" step="1" required value={linha.quantidade} onChange={e => mudar(linha.key, 'quantidade', e.target.value)} /></div><button className="text-button" type="button" disabled={linhas.length === 1} onClick={() => setLinhas(ls => ls.filter(l => l.key !== linha.key))} aria-label={`Remover produto ${index + 1}`}>Remover</button></div>
            <small>{produto ? `${produto.estoque} unidades disponíveis na última consulta` : 'O preço será confirmado pelo servidor.'}</small>
          </div>;
        })}
        <button className="secondary full" type="button" disabled={linhas.length >= 100} onClick={() => setLinhas(ls => [...ls, { key: nextKey.current++, produtoId: '', quantidade: '1' }])}>＋ Adicionar produto</button>
        <div className="total"><span>Total estimado</span><strong>{reais(totalCentavos / 100)}</strong></div>
        <p className="fine">O estoque e o preço são confirmados ao criar o pedido.</p>
        <button className="primary full" type="submit">{enviando ? 'Criando pedido…' : 'Criar pedido'}</button>
      </fieldset>
      {erro && <p role="alert" className="alert error">{erro}</p>}
    </form>
  </section>;
}
