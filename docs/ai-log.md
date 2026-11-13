# Registro verdadeiro de assistência

## 13/11/2026 — retomada com Codex

- O trabalho anterior foi recebido com 19 arquivos, sem commits e sem remoto. Backend, schema e Compose já estavam escritos; não foram desenvolvidos nos commits posteriores.
- A pasta original `new-chat-3/joya-mini-pedidos` foi preservada. A continuação ocorre em `new-chat-5/joya-mini-pedidos`, com cópia integral do estado Git.
- Commit inicial `012643e`: fotografia do estado recebido, sem validação de build ou testes. Não representa implementação passo a passo.
- Ian autorizou qualquer uma das duas contas Gmail para autoria. Escolhido Ian Borges / ianxoborges@gmail.com, somente na configuração local do repositório.
- Criado no Chrome o repositório privado `ian-Freire-Borges/joya-mini-pedidos`, vazio. Nenhum push executado.
- Docker CLI existe, mas acesso ao named pipe é negado neste terminal. .NET 10.0.404 executa com DOTNET_CLI_HOME dentro do projeto. Build inicial falhou por falta de project.assets.json; restore inicial bloqueado ao ler a configuração NuGet do perfil. Configuração pública por projeto adicionada para não depender daquele arquivo.
- Revisão estática: criação já usa transação única e UPDATE condicional; sem testes reais não é evidência de concorrência correta. Location relativa precisa correção. Frontend e testes ainda inexistentes no baseline.
- Somente Codex foi usado. Nenhuma sessão Claude, hook Claude, MCP, medição SQL ou teste aprovado foi inventado.

## Verificações

Cada commit futuro registra o motivo e os comandos aplicáveis. Resultados pendentes permanecem pendentes até execução bem-sucedida.

## Contratos e regras

- Corrigida Location do POST para incluir PathBase `/api` quando presente, com Nginx preservando o prefixo. Data de query agora exige ISO exato; corpo nulo recebe erro de regra.
- Adicionados testes xUnit v3 para limites de quantidade/itens, duplicidade, entradas nulas, IDs, decimal e datas UTC. Inexistência e estoque dependem de SQL Server e serão cobertos por integração real.
- `git diff --check`: sem erros. Primeira tentativa de `dotnet test --configfile` rejeitada porque a opção pertence a restore; comando corrigido para propriedade RestoreConfigFile. Testes ainda não aprovados.

## Frontend

- Implementada UI React/TypeScript com listagem, filtros de cliente/período, paginação, detalhes dos itens, ranking, formulário com vários produtos e estados de erro/vazio/carregamento.
- Envio protegido por ref e estado; totais da UI são estimativos, e somente produto/quantidade/cliente são enviados. Datas finais inclusivas viram próximo dia UTC.
- Nginx preserva `/api`, encaminhando ao PathBase da API. Adicionado Dockerfile do frontend; build ainda não executado.
- Restore dos testes com configuração local chegou ao NuGet e falhou com NU1301 / DNS de api.nuget.org. npm também retornou ENOTFOUND. Não são testes aprovados.
- Dependências frontend têm intervalos declarados; lockfile ainda depende de acesso ao registry. Dockerfile usa npm install provisoriamente, documentado como pendência de reprodutibilidade.
