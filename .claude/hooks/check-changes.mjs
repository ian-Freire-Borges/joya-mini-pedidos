import { realpathSync, readdirSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = realpathSync(resolve(dirname(fileURLToPath(import.meta.url)), '../..'));

function run(command, args, timeout = 120_000) {
  console.error(`[joya-hook] ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, {
    cwd: root, shell: false, stdio: ['ignore', 'inherit', 'inherit'], timeout,
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
  if (event.tool_name && !['Write', 'Edit'].includes(event.tool_name)) return;
  const file = event.tool_input?.file_path;
  if (typeof file !== 'string' || !file) throw new Error('Evento sem file_path válido.');
  // O caminho real impede que um link dentro do projeto escape para outro diretório.
  const target = realpathSync(resolve(root, file));
  const path = relative(root, target);
  if (isAbsolute(path) || path === '..' || path.startsWith(`..${sep}`)) {
    throw new Error('Recusado: arquivo fora do projeto.');
  }
  const normalized = path.split(sep).join('/');
  if (normalized.startsWith('frontend/') && /\.(?:[cm]?[jt]sx?|json)$/.test(normalized)) {
    const tests = readdirSync(resolve(root, 'frontend/tests'))
      .filter(name => name.endsWith('.test.mjs')).sort()
      .map(name => `frontend/tests/${name}`);
    if (!tests.length) throw new Error('Nenhum teste frontend encontrado.');
    run(process.execPath, ['--test', ...tests]);
  } else if (/^(backend|tests\/UnitTests)\//.test(normalized) ||
             ['global.json', 'NuGet.Config'].includes(normalized)) {
    const sdk = spawnSync('dotnet', ['--version'], { cwd: root, shell: false, encoding: 'utf8', timeout: 10_000 });
    if (sdk.error?.code === 'ENOENT') {
      run('docker', ['build', '--target', 'tests', '-f', 'backend/Dockerfile', '-t', 'joya-backend-testes', '.'], 300_000);
    } else {
      if (sdk.error || sdk.status !== 0) throw new Error('SDK .NET indisponível ou incompatível com global.json.');
      run('dotnet', ['test', 'tests/UnitTests/UnitTests.csproj', '-c', 'Release']);
    }
    console.error('[joya-hook] Unitários verificados; integração SQL real continua obrigatória para concluir a etapa.');
  } else if (/^(database|tests\/IntegrationTests)\//.test(normalized) || normalized.startsWith('docker-compose')) {
    console.error('[joya-hook] Mudança requer integração SQL real; execute o Compose de testes antes de concluir.');
  } else {
    console.error('[joya-hook] Arquivo sem verificação automática específica.');
  }
}

main().catch(error => {
  console.error(`[joya-hook] ${error.message}`);
  process.exitCode = 2;
});
