# Mini Gestão de Pedidos — Joya Solutions

Projeto de Ian Borges com API .NET 10/EF Core, React/TypeScript/Vite e SQL Server 2022 Developer. Assistência real: **Codex**. Claude Code e MCP ainda não utilizados/validados.

## Estado deste push inicial

Trabalho em andamento, sem aprovação de entrega. Banco inicializado e API compilada/iniciada no Docker do usuário. Frontend passou TypeScript, mas falhou no Vite por import CSS vazio; correção commitada, rebuild pendente. Testes automatizados não foram aprovados.

Veja [checkpoint-inicial.md](docs/checkpoint-inicial.md) para histórico por commit, evidências e pendências; [spec.md](docs/spec.md) para contratos e regras; [ai-log.md](docs/ai-log.md) para o registro verdadeiro de assistência.

## Estrutura

| Caminho | Responsabilidade |
|---|---|
| backend/Program.cs | Rotas, ProblemDetails, OpenAPI e PathBase /api |
| backend/PedidosService.cs | Consultas EF e criação transacional com baixa condicional |
| backend/Models.cs | Entidades, DTOs e regras de entrada |
| backend/PedidosDb.cs | Mapeamento SQL Server; sem migrations ou EnsureCreated |
| database/ | Schema autoritativo e seed com marcador de versão |
| frontend/ | Listagem, filtros, paginação, ranking e formulário; Nginx para /api |
| tests/UnitTests/ | Testes xUnit escritos, ainda não executados com sucesso |

Preço vem do servidor e é gravado no item; dinheiro usa decimal(18,2). Pedido, itens e baixa usam transação única. Produtos repetidos são rejeitados. Datas UTC, início inclusivo e fim exclusivo. Concorrência ainda precisa validação real.

## Execução por etapas

Docker Desktop com Linux containers e Compose. Para desenvolvimento no host: SDK .NET 10.0.404 e Node 24. Dentro da pasta do projeto, execute um comando por vez e confira o resultado:

```powershell
docker compose config --quiet
docker compose up -d --wait --wait-timeout 180 sql
docker compose run --rm db-init
docker compose build backend
docker compose up -d backend
docker compose logs --tail 40 backend
```

As etapas acima já foram executadas por Ian; saídas conferidas na conversa. O próximo comando pendente é:

```powershell
docker compose build frontend
```

Somente após passar: `docker compose up -d frontend`. Endereço previsto: http://localhost:8080 (ainda não conferido em execução). `JOYA_PORT` altera essa porta. SQL não publica porta no host; dados ficam em volume persistente. Não apagar volumes para diagnóstico.

O Compose contém senha de demonstração local, substituível por JOYA_SQL_PASSWORD. Não é configuração de produção. API ainda usa sa; usuário dedicado está pendente. SQL Server Developer é para desenvolvimento/testes. Sem autenticação; manter ambiente local.

## API

Base pública /api: GET /health, /clientes, /produtos, /pedidos/{id}, /pedidos e /relatorios/top-clientes; POST /pedidos. Documento: /api/openapi/v1.json. Filtros de pedidos: clienteId, inicio, fim, pagina, tamanho. Datas em yyyy-MM-dd.

Exemplo de corpo (não executado nesta documentação):

```json
{"clienteId":1,"itens":[{"produtoId":1,"quantidade":2}]}
```

## Verificação e limitações

Comandos previstos: `dotnet test tests/UnitTests` e `npm --prefix frontend run build`. O terminal do agente não acessa o daemon Docker e falhou no DNS de npm/NuGet. O PowerShell do usuário acessa Docker; o build da API baixou pacotes e concluiu. Isso não equivale a testes aprovados.

Integração SQL, concorrência, E2E, CI, métricas SQL, lockfiles, MCP real, Claude obrigatório, guia de estudo/PDF e vídeo continuam pendentes. Dockerfile frontend usa npm install provisoriamente enquanto não há lockfile. Não há resultado de UI/HTTP aprovado.

## Processo obrigatório

Uma etapa → testar → documentar resultado → commit → push confirmado → próxima etapa. Erro ou teste bloqueado interrompe a etapa. Nenhum merge sem testes aprovados e autorização de Ian.

Os cinco commits anteriores foram acumulados sem push, contrariando o pedido. São preservados sem reescrever histórico nem simular envios anteriores. Este primeiro envio é um checkpoint privado explicitamente solicitado.
