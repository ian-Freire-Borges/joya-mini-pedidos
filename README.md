# Mini Gestão de Pedidos — Joya Solutions

Aplicação de Ian Freire Borges: .NET 10, EF Core, React/TypeScript e SQL Server 2022. Desenvolvida com assistência do **Codex**; não houve uso de Claude nem conexão MCP ao SQL Server.

- Aplicação: https://joya-mini-pedidos.vercel.app/
- API: https://joya-mini-pedidos-api.onrender.com/api
- Repositório: https://github.com/ian-Freire-Borges/joya-mini-pedidos
- [Especificação](docs/spec.md) · [Plano e decisões de implementação](docs/plan.md)

## Executar com Docker

Requisitos: Docker com Linux containers e Docker Compose. Na raiz:

```powershell
docker compose up --build
```

Acesso: http://localhost:8080. O Compose define SQL Server, execução automática de schema/seed, API e frontend com Nginx. Os serviços já foram compilados e iniciados por etapas; **a subida completa a partir de ambiente limpo com esse único comando ainda precisa ser validada**.

Dados persistem no volume sql-data. JOYA_PORT altera a porta local; JOYA_SQL_PASSWORD substitui a senha de demonstração local. Não apagar volumes para diagnosticar problemas. O SQL local usa sa e certificado de desenvolvimento aceito pela configuração Compose; essa configuração não deve ser reutilizada em produção. A implantação pública valida o certificado do SQL.

## Executar os testes existentes

Unitários do backend, em container:

```powershell
docker build --target tests -f backend/Dockerfile -t joya-backend-testes .
```

Ou com SDK .NET 10 instalado:

```powershell
dotnet test tests/UnitTests/UnitTests.csproj -c Release
```

Frontend com Node 24:

```powershell
npm --prefix frontend install
npm --prefix frontend test
npm --prefix frontend run build
```

O build Docker do frontend também executa testes e compilação. **Ainda não existe projeto de testes de integração**; seu comando será incluído quando implementado, sem apresentar comandos inexistentes como funcionais.

Validação observada: seis testes Node aprovados; target Docker de testes unitários .NET concluído com sucesso por Ian; build TypeScript/Vite aprovado. Inspeção manual local e pública confirmou catálogos, seis pedidos, ranking e filtro por cliente. No site público, cliente 1 retornou dois pedidos e limpar restaurou seis. Essa inspeção não testou criação, rollback, concorrência nem navegação entre várias páginas.

## Organização e decisões técnicas

| Caminho | Responsabilidade |
|---|---|
| backend/Program.cs | Rotas, ProblemDetails, OpenAPI e PathBase /api |
| backend/PedidosService.cs | Consultas e criação transacional |
| backend/Models.cs; PedidosDb.cs | Entidades, contratos, regras e mapeamento |
| database/ | Schema SQL autoritativo e seed idempotente |
| frontend/src/pages; components | Coordenação da página e apresentação |
| frontend/src/hooks | Estado e ciclo de requisições/formulário |
| frontend/src/services; types; utils | Transporte HTTP, contratos e funções puras |
| tests/UnitTests; frontend/tests | Regressões de regras, tradução SQL e contratos frontend |

Preço é obtido no servidor e registrado no item. Valores usam decimal(18,2). Pedido, itens e baixa de estoque usam uma transação; atualização condicional evita baixar saldo insuficiente e OUTPUT captura o preço. Produtos são processados por ID crescente. Duplicatas são rejeitadas. Datas são UTC, com início inclusivo e fim exclusivo. Essas decisões ainda precisam dos testes de integração e concorrência.

SQL scripts são a fonte de verdade; EF apenas mapeia, sem migrations ou EnsureCreated paralelos. Frontend usa /api na mesma origem: Nginx no Docker e rewrite de frontend/vercel.json na Vercel preservam o prefixo para a API.

## Uso real da IA e correções

Codex apoiou especificação, implementação, revisão, testes e implantação. A separação do frontend em componentes, hooks, serviços e utilitários tornou as responsabilidades explícitas. O histórico Git preserva a evolução, inclusive erros e correções, sem squash.

Correções relevantes: import CSS vazio impedia build Vite; projeção de RankingDto antes da ordenação não era traduzida pelo EF, corrigida com agregação/ordenação/limite antes do DTO e teste ToQueryString; falta de rewrite causava 404 na Vercel, corrigida em frontend/vercel.json. A conexão Somee tinha alias diferente do SAN do certificado: configurado HostNameInCertificate=vb4400.mgmt.somee.com mantendo Encrypt=True e TrustServerCertificate=False. Nunca foi aplicada a proposta de ignorar a validação em produção.

O desenvolvimento inicial acumulou commits antes do primeiro push; isso foi corrigido no processo, sem fabricar um histórico retrospectivo. Fluxo atual: implementar, testar, documentar de forma proporcional, commit e push antes da próxima etapa.

## Hospedagem

Frontend no Vercel Hobby, API Docker no Render Free e SQL Server 2022 Express na Somee gratuita (30 MB). Schema/seed remoto conferido: 6 clientes, 4 produtos, 6 pedidos e 6 itens. Credenciais ficam no segredo ConnectionStrings__Pedidos do Render e fora do Git. Health através da Vercel respondeu status ok; listagem e ranking consultaram SQL real.

O Render gratuito pode adormecer e demorar para responder. Certificado Somee observado em 13/11/2026 tinha validade até 16/11/2026; renovação depende do provedor. Nenhuma garantia de renovação foi presumida.

## Debug da query do enunciado — pendente de implementação e medição

A investigação específica da Parte 4 ainda não foi entregue. Pontos identificáveis na query fornecida: YEAR(DataPedido) dificulta busca por índice; GROUP BY apenas Nome mistura homônimos; ORDER BY Total sem DESC ordena em sentido contrário ao ranking desejado; falta limitar aos cinco primeiros. O filtro em WHERE elimina linhas sem pedido do LEFT JOIN. A semântica dos joins deve ser alinhada ao ranking esperado.

Faltam script SQL corrigido, comparação de resultados e investigação real com plano de execução e STATISTICS IO/TIME. Índices já existem no schema, mas não foram medidas diferenças de desempenho. A correção de tradução EF do ranking não substitui essa atividade.

## Pendências para a entrega

- Integração automatizada dos endpoints com SQL Server real: criação, consultas, filtros, paginação e erros; comprovar rollback e estoque concorrente.
- Completar unitários para cliente inexistente e estoque insuficiente; pedido sem itens já está coberto.
- Entregar investigação SQL da Parte 4 com script, plano e medições reais.
- Validar subida completa com um comando e inicialização automática em ambiente limpo, sem apagar o volume existente.
- Configuração AI First: CLAUDE.md, .claude/, hook, skill e uso real de MCP. O enunciado declara Codex obrigatório, mas outras partes exigem Claude; esclarecer essa divergência antes de alegar conformidade.
- Atualizar o plano com ajustes/discordâncias efetivamente realizados; não inventar sessão Claude plan mode.
- Vídeo de até dez minutos e envio do repositório/vídeo à recrutadora. Nenhum e-mail de entrega enviado.

Melhorias e diferenciais: refatoração arquitetural do backend solicitada por Ian; lockfile frontend; corrigir rótulo “Ambiente local” no site e metadados OpenAPI; Playwright E2E e GitHub Actions. Deploy online já existe; não comprova os obrigatórios pendentes.
