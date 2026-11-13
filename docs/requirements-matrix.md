# Matriz de requisitos

## Estado atual após refatoração do frontend — 13/11/2026

Esta seção prevalece sobre os registros históricos abaixo. Frontend separado em componentes, página, hooks, serviços e utilitários; seis testes Node aprovados. Build Docker aprovou testes, TypeScript e Vite. Target Docker de testes unitários .NET executado com sucesso por Ian, incluindo regressão de tradução SQL do ranking. Navegador local com SQL real confirmou listagem, ranking, filtros, homônimos, detalhes e itens do formulário. Não houve criação de pedido nessa inspeção. Integração automatizada, concorrência, rollback, E2E automatizado e CI continuam pendentes. Produção ainda depende de banco externo e encaminhamento /api. Evidências: refatoracao-frontend.md.

## Atualização para o primeiro push

Esta atualização prevalece sobre a tabela histórica abaixo. Ian confirmou SQL Healthy, inicialização do schema/seed e contagem 6/4/6/6. API compilou e iniciou em Docker. Frontend passou TypeScript, falhou no Vite e aguarda rebuild após correção e088bb9. Unitários não foram executados com sucesso; integração, concorrência, E2E e CI não existem ainda. README/checkpoint agora documentados. Primeiro push privado na main autorizado; sucesso depende de conferência remota. Claude e MCP seguem pendentes. Ver checkpoint-inicial.md para evidências por comando/commit.

## Tabela anterior preservada para cronologia

Estado em 13/11/2026. Implementado significa escrito; validado exige execução observada.

| Exigência | Arquivo / comando | Estado |
|---|---|---|
| Especificação e plano reais | docs/spec.md; docs/plan.md | Implementado com Codex |
| Histórico honesto e incremental | git log; docs/ai-log.md | Baseline registrado |
| Schema, constraints e índices | database/001-schema.sql | Implementado, não executado |
| Seed repetível e datas limite | database/002-seed.sql | Implementado, não executado |
| Transação e estoque concorrente | backend/PedidosService.cs | Implementado, não validado |
| Contratos, filtros, ranking | backend/Program.cs; PedidosService.cs | Implementado, não validado |
| UI React/TypeScript | frontend/ | Implementado, build e inspeção visual pendentes |
| Testes unitários xUnit | dotnet test tests/UnitTests | Escrito; restore bloqueado por DNS, não executado |
| Integração SQL Server e concorrência | dotnet test tests/IntegrationTests | Pendente |
| Docker completo e reinicialização | docker compose up --build | Arquivos escritos; bloqueado por acesso negado ao daemon |
| Debug SQL, planos e IO/TIME | database/queries/ | Pendente; original exato não disponível |
| CI e E2E | .github/workflows/; frontend/e2e/ | Pendente |
| Claude Code / plan mode | Sessão real ou aceite da recrutadora | Pendente |
| MCP real | Operações de schema e ranking registradas | Pendente |
| README, estudo e roteiro | README.md; docs/ | Pendente |
| Repositório privado | https://github.com/ian-Freire-Borges/joya-mini-pedidos | Criado e verificado, sem push |
