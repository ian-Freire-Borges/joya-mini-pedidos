import assert from 'node:assert/strict';
import { test } from 'node:test';
import { queryPedidos, queryPeriodo, FILTROS_VAZIOS } from '../src/utils/filtros.ts';
import { calcularTotalEstimado, montarPedido, temProdutosRepetidos } from '../src/utils/formularioPedido.ts';
import { requisitar } from '../src/services/http.ts';
import { consultarPainel, criarPedido } from '../src/services/pedidosService.ts';
import { consultarCatalogo } from '../src/services/catalogoService.ts';

test('filtro final inclusivo atravessa virada de ano e fevereiro bissexto em UTC', () => {
  for (const [fim, esperado] of [['2026-12-31', '2027-01-01'], ['2024-02-29', '2024-03-01']]) {
    assert.equal(queryPeriodo({ ...FILTROS_VAZIOS, fim }).get('fim'), esperado);
  }
  assert.equal(queryPeriodo(FILTROS_VAZIOS).toString(), '');
});

test('paginação e cliente afetam somente a consulta de pedidos', () => {
  const filtros = { clienteId: '7', inicio: '2026-01-01', fim: '2026-12-31' };
  const pedidos = queryPedidos(filtros, 3);
  assert.equal(pedidos.get('clienteId'), '7');
  assert.equal(pedidos.get('pagina'), '3');
  assert.equal(pedidos.get('tamanho'), '10');
  assert.equal(queryPeriodo(filtros).has('clienteId'), false);
  assert.equal(queryPeriodo(filtros).get('fim'), '2027-01-01');
});

test('estimativa em centavos ignora entradas incompletas sem enviar preço ao backend', () => {
  const linhas = [{ key: 1, produtoId: '1', quantidade: '3' }, { key: 2, produtoId: '2', quantidade: '2' }];
  const produtos = [{ id: 1, nome: 'A', preco: .10, estoque: 5 }, { id: 2, nome: 'B', preco: 19.99, estoque: 5 }];
  assert.equal(calcularTotalEstimado(linhas, produtos), 40.28);
  assert.equal(calcularTotalEstimado([{ key: 3, produtoId: '', quantidade: '1' }], produtos), 0);
  assert.equal(calcularTotalEstimado([{ key: 3, produtoId: '1', quantidade: '1.5' }], produtos), 0);
  assert.deepEqual(montarPedido('8', linhas), {
    clienteId: 8,
    itens: [{ produtoId: 1, quantidade: 3 }, { produtoId: 2, quantidade: 2 }],
  });
  assert.equal(temProdutosRepetidos(linhas), false);
  assert.equal(temProdutosRepetidos([...linhas, { key: 3, produtoId: '1', quantidade: '1' }]), true);
});

test('transporte mantém ProblemDetails legível e sinal de cancelamento', async t => {
  const controller = new AbortController();
  const fetchMock = t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, '/api/produtos');
    assert.equal(options.signal, controller.signal);
    return new Response(JSON.stringify({ detail: 'Estoque insuficiente.' }), { status: 409 });
  });
  try {
    await assert.rejects(requisitar('/produtos', { signal: controller.signal }), /Estoque insuficiente/);
  } finally {
    fetchMock.mock.restore();
  }
});

test('erro sem JSON usa mensagem segura com status', async t => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => new Response('upstream error', { status: 502 }));
  try {
    await assert.rejects(requisitar('/pedidos'), /solicitação \(502\)/);
  } finally {
    fetchMock.mock.restore();
  }
});

test('serviços preservam rotas, consultas e corpo do POST sem rede real', async t => {
  const chamadas = [];
  const fetchMock = t.mock.method(globalThis, 'fetch', async (url, options) => {
    chamadas.push({ url, options });
    const corpo = url.startsWith('/api/pedidos?') ? { itens: [], totalRegistros: 0 } : [];
    return Response.json(corpo);
  });
  try {
    const signal = new AbortController().signal;
    await consultarCatalogo(signal);
    await consultarPainel({ clienteId: '4', inicio: '', fim: '2026-11-13' }, 2, signal);
    await criarPedido({ clienteId: 4, itens: [{ produtoId: 1, quantidade: 2 }] });
    assert.deepEqual(chamadas.map(item => item.url), [
      '/api/clientes', '/api/produtos',
      '/api/pedidos?fim=2026-11-14&clienteId=4&pagina=2&tamanho=10',
      '/api/relatorios/top-clientes?fim=2026-11-14', '/api/pedidos',
    ]);
    assert.equal(chamadas[4].options.method, 'POST');
    assert.deepEqual(JSON.parse(chamadas[4].options.body), {
      clienteId: 4, itens: [{ produtoId: 1, quantidade: 2 }],
    });
  } finally {
    fetchMock.mock.restore();
  }
});
