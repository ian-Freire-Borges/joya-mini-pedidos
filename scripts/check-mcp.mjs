import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const url = 'http://localhost:5005/mcp';
let session;
let id = 0;
let protocol = '2025-03-26';

async function rpc(method, params, notification = false) {
  const requestId = notification ? undefined : ++id;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json', Accept: 'application/json, text/event-stream',
      ...(session ? { 'Mcp-Session-Id': session, 'MCP-Protocol-Version': protocol } : {}),
    },
    body: JSON.stringify({ jsonrpc: '2.0', ...(notification ? {} : { id: requestId }), method, params }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`${method}: HTTP ${response.status} ${(await response.text()).slice(0, 1000)}`);
  session = response.headers.get('Mcp-Session-Id') ?? session;
  if (notification) { await response.body?.cancel(); return; }
  const body = await response.text();
  const messages = response.headers.get('content-type')?.includes('text/event-stream')
    ? body.split(/\r?\n\r?\n/).map(block => block.split(/\r?\n/)
      .filter(line => line.startsWith('data:')).map(line => line.slice(5).trim()).join('\n'))
      .filter(Boolean).map(text => JSON.parse(text))
    : [JSON.parse(body)];
  const message = messages.find(value => value.id === requestId);
  if (!message) throw new Error(`${method}: resposta JSON-RPC ausente.`);
  if (message.error) throw new Error(`${method}: ${JSON.stringify(message.error)}`);
  if (message.result?.isError) throw new Error(`${method}: ${JSON.stringify(message.result)}`);
  return message.result;
}

try {
  const initialized = await rpc('initialize', {
    protocolVersion: protocol, capabilities: {}, clientInfo: { name: 'joya-mcp-diagnostic', version: '1.0.0' },
  });
  protocol = initialized.protocolVersion;
  await rpc('notifications/initialized', {}, true);
  const discovery = await rpc('tools/list', {});
  const names = discovery.tools.map(tool => tool.name).sort();
  if (JSON.stringify(names) !== JSON.stringify(['describe_entities', 'read_records'])) {
    throw new Error(`Ferramentas inesperadas: ${names.join(', ')}. Pare e revise a configuração.`);
  }
  const description = await rpc('tools/call', { name: 'describe_entities', arguments: { entities: ['TopClientes2026'] } });
  const ranking = await rpc('tools/call', { name: 'read_records', arguments: {
    entity: 'TopClientes2026', first: 5, orderby: ['Total desc', 'ClienteId asc'],
  } });
  const payload = JSON.parse(ranking.content.find(block => block.type === 'text').text);
  const rows = payload.result?.value;
  if (payload.status !== 'success' || !Array.isArray(rows) || !rows.length || rows.length > 5) {
    throw new Error('Ranking não retornou entre um e cinco clientes de teste.');
  }
  if (new Set(rows.map(row => row.ClienteId)).size !== rows.length || rows.some((row, index) => {
    if (!Number.isFinite(row.Total) || !Number.isInteger(row.ClienteId)) return true;
    const previous = rows[index - 1];
    return previous && (previous.Total < row.Total ||
      (previous.Total === row.Total && previous.ClienteId > row.ClienteId));
  })) throw new Error('Ranking com IDs duplicados, valores inválidos ou ordenação inesperada.');
  const evidence = { checkedAt: new Date().toISOString(), transport: 'http', url,
    client: 'Cliente de diagnóstico manual; não demonstra conexão automática do chat.',
    initialized, discovery, description, ranking };
  const outputDir = resolve(root, 'TestResults/mcp');
  await mkdir(outputDir, { recursive: true });
  await writeFile(resolve(outputDir, 'evidence.json'), JSON.stringify(evidence, null, 2) + '\n');
  console.log(`MCP ${initialized.serverInfo?.name} ${initialized.serverInfo?.version}; protocolo ${protocol}`);
  console.log(`Ferramentas: ${names.join(', ')}`);
  console.log(JSON.stringify({ description, ranking }, null, 2));
  console.log('Evidência salva em TestResults/mcp/evidence.json');
} catch (error) {
  console.error(`Falha MCP: ${error.message}`);
  process.exitCode = 1;
}
