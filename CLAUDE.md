# Convenções do Joya

Leia `AGENTS.md`, `docs/spec.md` e `docs/plan.md` antes de trabalhar. Para endpoints, use a skill `.claude/skills/criar-endpoint/SKILL.md`.

## Arquitetura e contratos

- Backend ASP.NET Core 10, Minimal APIs e EF Core SQL Server. Frontend React/TypeScript, com componentes, hooks, serviços e utilitários separados. Respeite a organização atual antes de criar abstrações.
- C# usa PascalCase para tipos e membros, camelCase para parâmetros/variáveis; JSON camelCase. TypeScript mantém os padrões existentes. DTOs não são entidades de persistência.
- Rotas públicas usam `/api`. Preserve paginação, filtros UTC com fim exclusivo, `Location` e ProblemDetails.
- Preço vem do servidor; fotografia no item, dinheiro decimal(18,2). Itens duplicados são inválidos. Pedido, itens e baixa condicional de estoque compartilham uma transação; processe produtos por ID crescente.
- Scripts em `database/` são autoritativos. Sem EnsureCreated, migrations paralelas ou troca do banco dos testes por SQLite/EF InMemory.
- Preserve certificados verificados na hospedagem. Não grave segredos no Git nem rode inicializadores/testes destrutivos no banco publicado.

## Executar e verificar

Na raiz, aplicação completa: `docker compose up --build`.

Unitários: `dotnet test tests/UnitTests/UnitTests.csproj -c Release`; alternativa Docker: `docker build --target tests -f backend/Dockerfile -t joya-backend-testes .`.

Integração SQL Server real: `docker compose --progress plain -f docker-compose.tests.yml run --build --rm integration-tests`. Não execute suítes concorrentes no mesmo banco de testes.

Frontend: `npm --prefix frontend test` e `npm --prefix frontend run build`. Dependências: `npm ci` quando houver lockfile; caso contrário, `npm install`. Não atualize versões sem necessidade.

## Processo e automação

Uma etapa por vez: implementar, testar, documentar proporcionalmente, commit e push confirmado antes da próxima. Pare em falha de teste/build/acesso e descreva a causa. Preserve o histórico; não faça squash, rebase ou force-push. Não apague volumes.

`.claude/settings.json` configura um hook PostToolUse para Write/Edit. O script testa frontend com Node e backend com SDK .NET, ou Docker se o SDK estiver ausente. Ele não executa integração após cada edição: essa validação continua necessária antes de concluir uma mudança no backend. Se o hook falhar, não declare a etapa aprovada.

Na narrativa use agente de IA. Não invente uso de Claude Code, plan mode, acionamento automático de hook/skill, métricas ou testes. Um evento enviado manualmente ao script demonstra apenas execução manual.
