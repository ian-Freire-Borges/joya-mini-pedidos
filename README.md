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

O build Docker do frontend também executa testes e compilação.

Integração HTTP com SQL Server real, em containers separados dos serviços da aplicação:

```powershell
docker compose -f docker-compose.tests.yml run --build --rm integration-tests
```

O Compose usa o projeto joya-mini-pedidos-tests, sem portas publicadas nem volume compartilhado com a aplicação. Cria schema/seed pelos mesmos scripts de database/. A suíte chama a API em outro processo por HTTP e confere a persistência com SqlClient; não usa SQLite, EF InMemory ou mocks do banco. Cada caso limpa e repõe o seed somente nessa instância descartável; execução paralela dos casos está desabilitada. As duas compras do teste de concorrência são disparadas juntas. Não executar duas instâncias da suíte simultaneamente no mesmo projeto de testes.

Ao terminar, remova apenas os containers/rede de testes (não apaga volumes da aplicação):

```powershell
docker compose -f docker-compose.tests.yml down
```

Casos implementados: criação com itens/preço do servidor/Location/estoque, fotografia de preço, cliente e produto inexistentes, pedido sem itens, quantidade inválida, duplicatas, tentativa de enviar preço, estoque insuficiente, rollback após baixa do primeiro produto, concorrência do último item, consultas com período/cliente/paginação e ranking com homônimos. **Validação em 13/11/2026:** Ian executou o comando acima no PowerShell; build concluído e 21 testes passaram, 0 falhas e 0 ignorados, em aproximadamente 5,1 s. Saída conferida na conversa. O terminal do agente não acessa o Docker; a execução foi realizada no ambiente do usuário. Unitários de cliente inexistente/estoque insuficiente continuam pendentes; os casos acima são de integração.

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

Preço é obtido no servidor e registrado no item. Valores usam decimal(18,2). Pedido, itens e baixa de estoque usam uma transação; atualização condicional evita baixar saldo insuficiente e OUTPUT captura o preço. Produtos são processados por ID crescente. Duplicatas são rejeitadas. Datas são UTC, com início inclusivo e fim exclusivo. A suíte de integração aprovada verificou criação, rollback após falha de item e duas compras concorrentes do último item disponível. Esse cenário de concorrência não representa teste de carga nem prova de ausência de todos os possíveis deadlocks.

SQL scripts são a fonte de verdade; EF apenas mapeia, sem migrations ou EnsureCreated paralelos. Frontend usa /api na mesma origem: Nginx no Docker e rewrite de frontend/vercel.json na Vercel preservam o prefixo para a API.

## Uso real da IA e correções

Codex apoiou especificação, implementação, revisão, testes e implantação. A separação do frontend em componentes, hooks, serviços e utilitários tornou as responsabilidades explícitas. O histórico Git preserva a evolução, inclusive erros e correções, sem squash.

Correções relevantes: import CSS vazio impedia build Vite; projeção de RankingDto antes da ordenação não era traduzida pelo EF, corrigida com agregação/ordenação/limite antes do DTO e teste ToQueryString; falta de rewrite causava 404 na Vercel, corrigida em frontend/vercel.json. A conexão Somee tinha alias diferente do SAN do certificado: configurado HostNameInCertificate=vb4400.mgmt.somee.com mantendo Encrypt=True e TrustServerCertificate=False. Nunca foi aplicada a proposta de ignorar a validação em produção.

O desenvolvimento inicial acumulou commits antes do primeiro push; isso foi corrigido no processo, sem fabricar um histórico retrospectivo. Fluxo atual: implementar, testar, documentar de forma proporcional, commit e push antes da próxima etapa.

## Hospedagem

Frontend no Vercel Hobby, API Docker no Render Free e SQL Server 2022 Express na Somee gratuita (30 MB). Schema/seed remoto conferido: 6 clientes, 4 produtos, 6 pedidos e 6 itens. Credenciais ficam no segredo ConnectionStrings__Pedidos do Render e fora do Git. Health através da Vercel respondeu status ok; listagem e ranking consultaram SQL real.

O Render gratuito pode adormecer e demorar para responder. Certificado Somee observado em 13/11/2026 tinha validade até 16/11/2026; renovação depende do provedor. Nenhuma garantia de renovação foi presumida.

## Debug da query do enunciado

A query corrigida está em [database/queries/top-clientes.sql](database/queries/top-clientes.sql). O ranking considera clientes com compras no período; clientes sem compras não participam.

- `GROUP BY c.Nome` misturava clientes homônimos. Agrupar por ID e nome preserva as identidades.
- `ORDER BY Total` ordenava do menor para o maior. Usar `DESC` e `c.Id ASC` torna os empates determinísticos; `TOP (5)` limita o ranking.
- `YEAR(p.DataPedido)=2026` aplica função à coluna. O intervalo `>= 2026-01-01 AND < 2027-01-01` permite busca por faixa e inclui todas as frações do último dia. Isso permite, mas não garante, Index Seek: a escolha depende de cardinalidade, estatísticas e custo.
- O filtro em WHERE já removia linhas do LEFT JOIN sem pedidos no ano. INNER JOIN expressa a intenção do ranking de compradores. Cliente sem pedidos, como Eva no seed, não deve aparecer com total nulo.

Índices existentes: Pedidos(DataPedido,ClienteId) atende ao período; Pedidos(ClienteId,DataPedido) atende ao filtro por cliente e período. A PK clustered de Pedidos inclui Id na folha dos índices não clustered. A PK clustered de ItensPedido(PedidoId,ProdutoId) permite o join por PedidoId e contém quantidade/preço na folha. Não foi adicionado índice redundante nem imposto hint sem medição.

### Executar investigação no SQL de testes

```powershell
docker compose -f docker-compose.tests.yml run --rm query-analysis
```

Resultado bruto em `TestResults/sql/comparacao-ranking.txt` (ignorado pelo Git). O serviço usa a instância separada de testes; o script só altera tabelas temporárias da própria sessão e não toca nas tabelas do aplicativo. Não executar junto da suíte de integração para evitar interferência de carga nas medições.

O script comparar-ranking.sql verifica resultados esperados de homônimos e fronteiras, TOP 5 e desempate, depois gera 100 mil pedidos sintéticos distribuídos por aproximadamente dez anos e mil clientes. Replica os índices de leitura relevantes, atualiza estatísticas com FULLSCAN, aquece as consultas e executa três rodadas alternando a ordem. Não limpa cache global. Compara original, uma versão com semântica corrigida mas ainda YEAR e a versão por intervalo; valida equivalência dos dois controles antes de medir. A primeira rodada inclui plano real tabular com STATISTICS PROFILE; todas incluem STATISTICS IO/TIME. A original tem semântica/cardinalidade diferente; o par YEAR_CONTROLE/INTERVALO permite analisar o efeito do predicado sem essa confusão.

### Resultado observado em 13/11/2026

Ian executou o serviço query-analysis. Relatório lido integralmente para extrair resultados e planos: SQL Server 2022 CU28, 16.0.4325.4, Linux. Passaram as verificações de homônimos/fronteiras, TOP 5/desempate e equivalência entre YEAR_CONTROLE e INTERVALO. Massa: 100.000 pedidos, dos quais 9.855 em 2026. Na fixture, a original fundiu as duas Ana Silva em 449,70; a corrigida separou cliente 2 (299,80) e cliente 1 (149,90).

| Consulta | Leituras lógicas por rodada (Clientes + Pedidos + Itens) | CPU ms, rodadas 1/2/3 | Tempo ms, rodadas 1/2/3 |
|---|---|---|---|
| Original, resultado incorreto | 7 + 326 + 417 = 750 | 52 / 41 / 40 | 48 / 43 / 38 |
| YEAR_CONTROLE, semântica corrigida | 10 + 361 + 417 = 788 | 19 / 20 / 20 | 22 / 19 / 20 |
| INTERVALO, corrigida e sargable | 10 + 361 + 417 = 788 | 20 / 12 / 16 | 17 / 14 / 14 |

Tempos referentes à execução da instrução interna, sem somar novamente a mensagem do sp_executesql. Todas as consultas tiveram zero leituras físicas, com cache aquecido; a primeira rodada inclui profiling. Três execuções locais curtas não estabelecem ganho universal ou benchmark de produção. O menor tempo observado da versão por intervalo não foi acompanhado de redução de IO; não atribuir toda a diferença original/corrigida ao predicado, pois agrupamento, joins e quantidade de linhas retornadas também mudaram.

**Plano real:** YEAR_CONTROLE e INTERVALO usaram Clustered Index Scan em Pedidos e ItensPedido, Merge Join, Hash Match Aggregate, ordenação/Top e buscas de cinco clientes pela PK. Apesar do índice DataPedido/ClienteId disponível, o plano escolhido varreu na ordem da PK para o merge join; a interpretação é que esse caminho evitou a ordenação adicional necessária em uma alternativa por faixa. O filtro por intervalo continuou residual nesse plano; não foi observado Index Seek em Pedidos. Linhas estimadas após o filtro: aproximadamente 11.623,5 com YEAR e 9.864,8 com intervalo; ambas retornaram 9.855 linhas reais. O intervalo melhorou a estimativa e removeu a função da coluna, mas não mudou o acesso escolhido nesse cenário. O scan de Itens retornou 98.239 linhas antes do encerramento do merge, contra estimativa de 100.000. A original usou scan de índice de Pedidos, agregação por nome e ordenações, retornando 999 grupos no benchmark.

Não adicionado novo índice nem forçado seek: os índices existentes cobrem os acessos relevantes, e este ensaio não demonstrou benefício de um índice adicional. Outra distribuição/seletividade pode justificar nova comparação; um índice só deve ser adotado após medir leituras, planos e custo de escrita. A correção entregue atende aos resultados esperados e torna o predicado apto a busca por intervalo.

Referências: https://learn.microsoft.com/en-us/sql/t-sql/statements/set-statistics-profile-transact-sql ; https://learn.microsoft.com/en-us/sql/t-sql/statements/set-statistics-io-transact-sql ; https://learn.microsoft.com/en-us/sql/t-sql/statements/set-statistics-time-transact-sql .

## Pendências para a entrega

Unitários adicionais de cliente inexistente, estoque insuficiente, produto inexistente e preservação do preço decimal executados com sucesso conforme confirmação de Ian em 13/11/2026; contagem dessa execução não informada. Após a extração das regras usadas por PedidosService, integração repetida: 21 testes aprovados, 0 falhas, 0 ignorados, aproximadamente 5,2 s; build concluído em 5,6 s. O teste unitário interpreta o resultado da baixa; atualização SQL, rollback e concorrência são verificados pela integração real.
- Validar subida completa com um comando e inicialização automática em ambiente limpo, sem apagar o volume existente.
- Configuração AI First: CLAUDE.md, .claude/, hook, skill e uso real de MCP. O enunciado declara Codex obrigatório, mas outras partes exigem Claude; esclarecer essa divergência antes de alegar conformidade.
- Atualizar o plano com ajustes/discordâncias efetivamente realizados; não inventar sessão Claude plan mode.
- Vídeo de até dez minutos e envio do repositório/vídeo à recrutadora. Nenhum e-mail de entrega enviado.

Melhorias e diferenciais: refatoração arquitetural do backend solicitada por Ian; lockfile frontend; corrigir rótulo “Ambiente local” no site e metadados OpenAPI; Playwright E2E e GitHub Actions. Deploy online já existe; não comprova os obrigatórios pendentes.
