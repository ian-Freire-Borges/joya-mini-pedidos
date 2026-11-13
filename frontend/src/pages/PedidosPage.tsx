import { useState } from 'react';
import { Alerta } from '../components/common/Alerta';
import { Paginacao } from '../components/common/Paginacao';
import { FiltrosPedidos } from '../components/pedidos/FiltrosPedidos';
import { FormularioPedido } from '../components/pedidos/FormularioPedido';
import { RankingClientes } from '../components/pedidos/RankingClientes';
import { TabelaPedidos } from '../components/pedidos/TabelaPedidos';
import { useCatalogo } from '../hooks/useCatalogo';
import { useConsultaPedidos } from '../hooks/useConsultaPedidos';
import type { FiltrosPedidos as Filtros, Pedido } from '../types/pedidos';
import { FILTROS_VAZIOS } from '../utils/filtros';
import { reais } from '../utils/formatacao';

export function PedidosPage() {
  const [rascunho, setRascunho] = useState<Filtros>(FILTROS_VAZIOS);
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_VAZIOS);
  const [pagina, setPagina] = useState(1);
  const [revisao, setRevisao] = useState(0);
  const [sucesso, setSucesso] = useState('');
  const [erroFiltro, setErroFiltro] = useState('');
  const catalogo = useCatalogo(revisao);
  const consulta = useConsultaPedidos(filtros, pagina, revisao);
  const erro = erroFiltro || consulta.erro;

  function aplicarFiltros() {
    if (rascunho.inicio && rascunho.fim && rascunho.inicio > rascunho.fim) {
      setErroFiltro('A data inicial deve ser anterior ou igual à final.');
      return;
    }

    setErroFiltro('');
    setPagina(1);
    setFiltros({ ...rascunho });
  }

  function limparFiltros() {
    setErroFiltro('');
    setRascunho(FILTROS_VAZIOS);
    setFiltros(FILTROS_VAZIOS);
    setPagina(1);
  }

  function pedidoCriado(pedido: Pedido) {
    setSucesso(`Pedido #${pedido.id} criado com sucesso — ${reais(pedido.total)}.`);
    limparFiltros();
    setRevisao(atual => atual + 1);
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">VISÃO GERAL</div>
          <h1>Pedidos, em dia.</h1>
          <p className="muted">Consulte suas vendas e registre o próximo pedido.</p>
        </div>
        <button className="secondary" onClick={() => setRevisao(atual => atual + 1)}>
          ↻ Atualizar
        </button>
      </div>
      {sucesso && <Alerta tipo="success" onFechar={() => setSucesso('')}>{sucesso}</Alerta>}
      {catalogo.erro && <Alerta>{catalogo.erro}</Alerta>}
      <div className="layout">
        <div className="content">
          <section className="card" aria-labelledby="lista-titulo">
            <div className="section-heading">
              <h2 id="lista-titulo">Todos os pedidos</h2>
              <span className="badge">
                {consulta.carregando ? 'Consultando…' : `${consulta.dados?.totalRegistros ?? 0} registros`}
              </span>
            </div>
            <FiltrosPedidos
                clientes={catalogo.clientes} valores={rascunho} onMudar={setRascunho}
                onAplicar={aplicarFiltros} onLimpar={limparFiltros}
            />
            <div aria-live="polite" aria-busy={consulta.carregando}>
              <TabelaPedidos
                  pedidos={consulta.dados?.itens ?? []}
                  carregando={consulta.carregando} erro={erro}
              />
            </div>
            <Paginacao
                pagina={pagina} totalPaginas={consulta.dados?.totalPaginas ?? 0}
                carregando={consulta.carregando} temErro={!!erro} onMudar={setPagina}
            />
          </section>
          <RankingClientes
              clientes={consulta.ranking} carregando={consulta.carregando} temErro={!!erro}
          />
        </div>
        <FormularioPedido clientes={catalogo.clientes} produtos={catalogo.produtos} onCreated={pedidoCriado} />
      </div>
    </>
  );
}
