# Checkpoint inicial — 13/11/2026

Destino autorizado por Ian: repositório privado ian-Freire-Borges/joya-mini-pedidos, branch main. Envio do trabalho existente, sem merge, squash, amend, force push ou simulação de validação. O documento registra preparação; sucesso do push exige conferir SHA remoto.

## Commits preservados

| Commit | Mudança e motivo | Validação real / limite |
|---|---|---|
| 012643e | Registra 19 arquivos recebidos, backend/schema/Compose já escritos antes desta sessão | Revisão do estado inicial; sem build/testes naquele momento |
| e7a6c37 | Registro de retomada, matriz de requisitos, NuGet.Config público e ignores | Diff revisado; restore bloqueado por permissões/DNS |
| 27032cf | Corrige Location/PathBase, datas ISO e corpo nulo; adiciona xUnit de regras | Diff verificado; testes bloqueados no restore. API compilada posteriormente por Ian |
| 95a55aa | UI React, listagem, filtros, ranking, formulário, Dockerfile e Nginx | TypeScript passou no Docker; Vite falhou por import CSS vazio |
| e088bb9 | Remove o import CSS que causou a falha e registra validações do usuário | Diff sem erros; rebuild pendente |
| Commit desta documentação | README, checkpoint e atualização do fluxo/estado | Integridade Git, JSON/XML e diff; sem declarar testes de aplicação aprovados |

O agente acumulou os cinco commits sem push e avançou com bloqueios, contrariando o fluxo solicitado. Ian apontou o erro e autorizou agora este primeiro push. Essa falha não será ocultada reescrevendo histórico. Autoria local autorizada: Ian Borges / ianxoborges@gmail.com.

## Evidências fornecidas por Ian no PowerShell

| Comando | Resultado observado | Limite |
|---|---|---|
| docker version | Client e Server, Engine 29.9.3 / Desktop 4.99.0 | Não libera o terminal do agente |
| docker compose config --quiet | Retorno ao prompt sem erros | Valida configuração, não comportamento |
| docker compose up -d --wait --wait-timeout 180 sql | Container Healthy | Não valida API |
| docker compose run --rm db-init | Scripts concluídos | Repetibilidade integral ainda não testada |
| Consulta COUNT das tabelas | 6 clientes, 4 produtos, 6 pedidos, 6 itens | Não testa constraints nem concorrência |
| docker compose build backend | Restore/publish passaram; imagem Built | Não executa suíte de testes |
| up -d backend e logs | Started, ouvindo em 8080, Production | Nenhum endpoint exercitado ainda |
| docker compose build frontend | tsc passou; Vite falhou com PostCSS ENOENT data:text/css | Frontend não está aprovado |

O import CSS vazio foi um erro do Codex. Foi removido em e088bb9; não há resultado posterior de rebuild. Unitários estão escritos, mas dotnet test falhou no restore (NU1301/DNS). Integração SQL real, HTTP, rollback, preço do servidor, filtros, ranking, datas limite, concorrência e E2E não foram validados. CI ainda não existe.

## Bloqueios e próximos passos

Terminal do agente: permission denied no named pipe Docker e DNS npm/NuGet; não presumir falha de rede da máquina inteira. Ambiente do usuário já tem SDK e Docker instalados; não repetir instruções antigas de instalação.

Após confirmar este push, retomar somente o build frontend corrigido. Se houver erro, parar e resolver na mesma etapa. Depois registrar evidência real, commit e push antes de avançar. Não incluir novas funcionalidades neste checkpoint.

Pendências adicionais: usuário SQL dedicado (API usa sa), lockfiles, métricas SQL e query original exata do enunciado, MCP, Claude real/plan mode, documentação de estudo/PDF e vídeo. Somente Codex foi utilizado.
