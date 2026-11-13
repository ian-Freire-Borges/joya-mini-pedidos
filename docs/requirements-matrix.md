# Matriz de requisitos

Estado em 13/11/2026. Implementado significa escrito; validado exige execução observada.

| Exigência | Arquivo / comando | Estado |
|---|---|---|
| Especificação e plano reais | docs/spec.md; docs/plan.md | Implementado com Codex |
| Histórico honesto e incremental | git log; docs/ai-log.md | Baseline registrado |
| Schema, constraints e índices | database/001-schema.sql | Implementado, não executado |
| Seed repetível e datas limite | database/002-seed.sql | Implementado, não executado |
| Transação e estoque concorrente | backend/PedidosService.cs | Implementado, não validado |
| Contratos, filtros, ranking | backend/Program.cs; PedidosService.cs | Implementado, não validado |
| UI React/TypeScript | frontend/ | Pendente |
| Testes unitários xUnit | dotnet test tests/UnitTests | Pendente |
| Integração SQL Server e concorrência | dotnet test tests/IntegrationTests | Pendente |
| Docker completo e reinicialização | docker compose up --build | Bloqueado: acesso negado ao daemon; frontend ausente |
| Debug SQL, planos e IO/TIME | database/queries/ | Pendente; original exato não disponível |
| CI e E2E | .github/workflows/; frontend/e2e/ | Pendente |
| Claude Code / plan mode | Sessão real ou aceite da recrutadora | Pendente |
| MCP real | Operações de schema e ranking registradas | Pendente |
| README, estudo e roteiro | README.md; docs/ | Pendente |
| Repositório privado | https://github.com/ian-Freire-Borges/joya-mini-pedidos | Criado e verificado, sem push |
