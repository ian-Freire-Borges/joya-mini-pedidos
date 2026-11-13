import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { api, dataUtc, queryPeriodo, reais } from './api';
import type { Cliente, Filtros, Pagina, Pedido, Produto, Ranking } from './api';
import { NovoPedido } from './NovoPedido';

const vazio: Filtros = { clienteId: '', inicio: '', fim: '' };
export default function App() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [catalogoErro, setCatalogoErro] = useState('');
  const [draft, setDraft] = useState(vazio);
  const [filtros, setFiltros] = useState(vazio);
  const [pagina, setPagina] = useState(1);
  const [dados, setDados] = useState<Pagina>();
  const [ranking, setRanking] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setCatalogoErro('');
    Promise.all([api<Cliente[]>('/clientes', { signal: controller.signal }), api<Produto[]>('/produtos', { signal: controller.signal })])
      .then(([cs, ps]) => { if (!controller.signal.aborted) { setClientes(cs); setProdutos(ps); } })
      .catch(() => { if (!controller.signal.aborted) setCatalogoErro('Não foi possível carregar clientes e produtos. Tente atualizar.'); });
    return () => controller.abort();
  }, [revision]);
  useEffect(() => {
    const controller = new AbortController();
    let ativa = true;
    setLoading(true); setErro('');
    const query = queryPeriodo(filtros);
    const rankQuery = query.toString();
    if (filtros.clienteId) query.set('clienteId', filtros.clienteId);
    query.set('pagina', String(pagina)); query.set('tamanho', '10');
    Promise.all([api<Pagina>(`/pedidos?${query}`, { signal: controller.signal }), api<Ranking[]>(`/relatorios/top-clientes?${rankQuery}`, { signal: controller.signal })])
      .then(([ps, rs]) => { if (ativa) { setDados(ps); setRanking(rs); } })
      .catch(error => { if (ativa) setErro(error instanceof Error ? error.message : 'Falha ao consultar pedidos.'); })
      .finally(() => { if (ativa) setLoading(false); });
    return () => { ativa = false; controller.abort(); };
  }, [filtros, pagina, revision]);
  function aplicar(event: FormEvent) {
    event.preventDefault();
    if (draft.inicio && draft.fim && draft.inicio > draft.fim) { setErro('A data inicial deve ser anterior ou igual à final.'); return; }
    setPagina(1); setFiltros({ ...draft });
  }
  function criado(pedido: Pedido) {
    setSucesso(`Pedido #${pedido.id} criado com sucesso — ${reais(pedido.total)}.`);
    setPagina(1); setDraft(vazio); setFiltros(vazio); setRevision(r => r + 1);
  }
  return <>
    <header className="topbar"><a className="brand" href="/" aria-label="Joya início"><span className="brand-icon">j.</span><span>joya<span className="brand-sub">mini gestão</span></span></a><span className="workspace">Gestão de pedidos <span className="dot" /> Ambiente local</span></header>
    <main>
      <div className="page-heading"><div><div className="eyebrow">VISÃO GERAL</div><h1>Pedidos, em dia.</h1><p className="muted">Consulte suas vendas e registre o próximo pedido.</p></div><button className="secondary" onClick={() => setRevision(r => r + 1)}>↻ Atualizar</button></div>
      {sucesso && <div role="status" className="alert success">{sucesso}<button className="text-button" aria-label="Fechar confirmação" onClick={() => setSucesso('')}>Fechar</button></div>}
      {catalogoErro && <div role="alert" className="alert error">{catalogoErro}</div>}
      <div className="layout"><div className="content">
        <section className="card" aria-labelledby="lista-titulo">
          <div className="section-heading"><h2 id="lista-titulo">Todos os pedidos</h2><span className="badge">{loading ? 'Consultando…' : `${dados?.totalRegistros ?? 0} registros`}</span></div>
          <form className="filters" onSubmit={aplicar}>
            <div><label htmlFor="filtro-cliente">Cliente</label><select id="filtro-cliente" value={draft.clienteId} onChange={e => setDraft({ ...draft, clienteId: e.target.value })}><option value="">Todos os clientes</option>{clientes.map(c => <option key={c.id} value={c.id}>{c.nome} · #{c.id}</option>)}</select></div>
            <div><label htmlFor="inicio">De</label><input id="inicio" type="date" min="0001-01-01" max="9998-12-31" value={draft.inicio} onChange={e => setDraft({ ...draft, inicio: e.target.value })} /></div>
            <div><label htmlFor="fim">Até</label><input id="fim" type="date" min="0001-01-01" max="9998-12-31" value={draft.fim} onChange={e => setDraft({ ...draft, fim: e.target.value })} /></div>
            <button type="submit" className="primary">Filtrar</button><button type="button" className="text-button" onClick={() => { setDraft(vazio); setFiltros(vazio); setPagina(1); }}>Limpar</button>
          </form>
          <div aria-live="polite" aria-busy={loading}>
            {loading ? <div className="empty">Carregando pedidos…</div> : erro ? <div role="alert" className="alert error">{erro}</div> : !dados?.itens.length ? <div className="empty"><strong>Nenhum pedido por aqui.</strong><p>Crie um pedido ou ajuste os filtros.</p></div> : <div className="table-scroll"><table><caption className="sr-only">Pedidos em ordem do mais recente. Datas em UTC.</caption><thead><tr><th>Pedido / cliente</th><th>Data · UTC</th><th>Produtos</th><th className="number">Total</th></tr></thead><tbody>{dados.itens.map(p => <tr key={p.id}><td><strong>#{p.id}</strong><span className="cell-sub">{p.clienteNome} · cliente #{p.clienteId}</span></td><td>{dataUtc(p.dataPedido)}</td><td><details><summary>{p.itens.length} {p.itens.length === 1 ? 'produto' : 'produtos'}</summary><ul className="detail-items">{p.itens.map(i => <li key={i.produtoId}>{i.quantidade} × {i.produtoNome}<span>{reais(i.precoUnitario)} / un. · {reais(i.subtotal)}</span></li>)}</ul></details></td><td className="number amount">{reais(p.total)}</td></tr>)}</tbody></table></div>}
          </div>
          <nav className="pagination" aria-label="Paginação de pedidos"><span>Página {pagina} de {Math.max(1, dados?.totalPaginas ?? 1)}</span><div><button className="secondary" disabled={loading || pagina <= 1} onClick={() => setPagina(p => p - 1)}>Anterior</button><button className="secondary" disabled={loading || !!erro || !dados || pagina >= dados.totalPaginas} onClick={() => setPagina(p => p + 1)}>Próxima</button></div></nav>
        </section>
        <section className="card ranking" aria-labelledby="ranking-titulo"><div className="section-heading"><div><div className="eyebrow">QUEM MAIS COMPRA</div><h2 id="ranking-titulo">Top 5 clientes</h2></div><span className="muted small">Período dos filtros · todos os clientes</span></div>{loading ? <p className="muted">Consultando ranking…</p> : erro ? <p className="muted">Ranking indisponível nesta consulta.</p> : !ranking.length ? <p className="muted">Sem compras no período selecionado.</p> : <ol className="ranking-list">{ranking.map((c, i) => <li key={c.clienteId}><span className="rank-number">{String(i + 1).padStart(2, '0')}</span><span>{c.nome}<small>Cliente #{c.clienteId}</small></span><strong>{reais(c.total)}</strong></li>)}</ol>}</section>
      </div><NovoPedido clientes={clientes} produtos={produtos} onCreated={criado} /></div>
      <footer>Joya Solutions · Mini Gestão de Pedidos<span>Datas e períodos em UTC</span></footer>
    </main>
  </>;
}
