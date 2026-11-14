import { realpathSync, readdirSync, existsSync, mkdirSync, appendFileSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = realpathSync(resolve(dirname(fileURLToPath(import.meta.url)), '../..'));

function run(command, args, timeout = 120_000) {
  console.error(`[joya-hook] ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, {
    cwd: root, shell: false, stdio: ['ignore', 2, 2], timeout,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`Verificação falhou: código ${result.status}, sinal ${result.signal ?? 'nenhum'}.`);
}

async function main() {
  let input = '';
  for await (const chunk of process.stdin) {
    input += chunk;
    if (input.length > 1_048_576) throw new Error('Evento excede o limite de 1 MiB.');
  }
  const event = JSON.parse(input);
  if (event.hook_event_name !== 'PostToolUse') return;
  if (event.tool_name && !['Write', 'Edit', 'apply_patch'].includes(event.tool_name)) return;
  const files = event.tool_name === 'apply_patch'
    ? [...String(event.tool_input?.command ?? '').matchAll(/^\*\*\* (?:(?:Update|Add|Delete) File|Move to): (.+)$/gm)].map(match => match[1].trim())
    : [event.tool_input?.file_path];
  if (!files.length || files.some(file => typeof file !== 'string' || !file)) {
    throw new Error('Evento sem caminho de arquivo válido.');
  }
  const paths = files.map(file => {
    const absolute = resolve(root, file);
    const outside = path => isAbsolute(path) || path === '..' || path.startsWith(`..${sep}`);
    if (outside(relative(root, absolute))) throw new Error('Recusado: arquivo fora do projeto.');
    // Para exclusões, valide o diretório real remanescente; links também não podem escapar.
    const target = existsSync(absolute) ? realpathSync(absolute) : realpathSync(dirname(absolute));
    if (outside(relative(root, target))) throw new Error('Recusado: arquivo fora do projeto.');
    return relative(root, absolute).split(sep).join('/');
  });
  const checks = [];
  if (paths.some(path => path.startsWith('frontend/') && /\.(?:[cm]?[jt]sx?|json)$/.test(path))) {
    const tests = readdirSync(resolve(root, 'frontend/tests'))
      .filter(name => name.endsWith('.test.mjs')).sort()
      .map(name => `frontend/tests/${name}`);
    if (!tests.length) throw new Error('Nenhum teste frontend encontrado.');
    run(process.execPath, ['--test', ...tests]);
    checks.push('frontend');
  }
  if (paths.some(path => /^(backend|tests\/UnitTests)\//.test(path) ||
             ['global.json', 'NuGet.Config'].includes(path))) {
    const sdk = spawnSync('dotnet', ['--version'], { cwd: root, shell: false, encoding: 'utf8', timeout: 10_000 });
    if (sdk.error?.code === 'ENOENT') {
      run('docker', ['build', '--target', 'tests', '-f', 'backend/Dockerfile', '-t', 'joya-backend-testes', '.'], 300_000);
    } else {
      if (sdk.error || sdk.status !== 0) throw new Error('SDK .NET indisponível ou incompatível com global.json.');
      run('dotnet', ['test', 'tests/UnitTests/UnitTests.csproj', '-c', 'Release']);
    }
    console.error('[joya-hook] Unitários verificados; integração SQL real continua obrigatória para concluir a etapa.');
    checks.push('backend');
  }
  if (paths.some(path => /^(database|tests\/IntegrationTests)\//.test(path) || path.startsWith('docker-compose'))) {
    console.error('[joya-hook] Mudança requer integração SQL real; execute o Compose de testes antes de concluir.');
    checks.push('integration-required');
  }
  if (!checks.length) console.error('[joya-hook] Arquivo sem verificação automática específica.');
  const evidenceDir = resolve(root, 'TestResults/hooks');
  mkdirSync(evidenceDir, { recursive: true });
  appendFileSync(resolve(evidenceDir, 'events.jsonl'), JSON.stringify({
    checkedAt: new Date().toISOString(), event: event.hook_event_name, tool: event.tool_name ?? null,
    sessionId: event.session_id ?? null, toolUseId: event.tool_use_id ?? null, paths, checks, status: 'passed',
  }) + '\n');
  console.log(JSON.stringify({ systemMessage: `[joya-hook] Verificações concluídas: ${checks.join(', ') || 'sem teste específico'}.` }));
}

main().catch(error => {
  console.error(`[joya-hook] ${error.message}`);
  process.exitCode = 2;
});
