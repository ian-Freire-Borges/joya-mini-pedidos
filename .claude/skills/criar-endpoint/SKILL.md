---
name: criar-endpoint
description: Criar, alterar ou revisar endpoints da API Joya de pedidos, seguindo os contratos HTTP, as regras de estoque e os testes SQL Server deste projeto. Usar para mudanças no backend relacionadas a pedidos, catálogos ou ranking.
---

# Criar endpoint no Joya

## Antes de alterar

Leia `AGENTS.md`, `docs/spec.md` e `docs/plan.md` a partir da raiz do repositório. Confira o estado Git e o código atual: este projeto pode ter sido refatorado desde a criação da skill. Localize as rotas em `backend/Program.cs` ou em suas extensões, os contratos, `RegrasPedido`, `PedidosService` e `PedidosDb` pelos símbolos.

Defina o método, a rota, a entrada, a resposta e os casos de erro da mudança solicitada. Reutilize os contratos existentes quando compatíveis. Não amplie para cadastro de clientes/produtos, cancelamento ou outras funções sem pedido do usuário.

## Lista de conferência da implementação

- Mantenha a API em Minimal APIs e a lógica de negócio nos serviços. Separe DTOs de entidades; não exponha novas entidades de persistência como resposta por conveniência.
- Preserve o prefixo público `/api`, inclusive no `Location` de uma criação. Não duplique esse prefixo quando `UsePathBase` já o aplica.
- Em pedidos, confira cliente, lista de itens, produtos e quantidades. Rejeite produtos repetidos. Os limites atuais estão na spec e nas regras usadas em produção.
- O cliente envia apenas os identificadores e quantidades. Obtenha o preço no servidor, registre sua fotografia no item e calcule totais com `decimal`, mantendo precisão SQL `decimal(18,2)`.
- Pedido, itens e estoque pertencem à mesma transação. Uma falha em qualquer item deve desfazer todas as alterações. Preserve a baixa SQL parametrizada com condição de saldo e captura do preço por `OUTPUT`; não troque por leitura de estoque seguida de atualização sem condição.
- Processe produtos por ID crescente. Não mova uma atualização de estoque para fora da transação durante extrações de classes ou métodos.
- Preserve erros seguros em ProblemDetails: entrada inválida 400, recurso ausente 404, estoque/conflito 409 e criação 201. Não exponha exceções ou credenciais em respostas.
- Use UTC; início de período inclusivo e fim exclusivo. Faça filtros, paginação e agregações no banco. No ranking, agrupe cliente por ID e nome, ordene total decrescente e ID crescente, limite a cinco antes de materializar.
- Scripts em `database/` são a fonte do schema. Não acrescente `EnsureCreated` ou migrations paralelas. Nunca use o banco publicado para testes que alteram dados.

## Verificar a mudança

Adapte os testes ao comportamento alterado: casos de regra puros em `tests/UnitTests`, contratos HTTP e persistência em `tests/IntegrationTests`. Para alterações em criação/estoque, confira sucesso, saldo insuficiente, rollback no segundo item e duas compras concorrentes do último produto. Não substitua SQL Server por EF InMemory ou SQLite.

Execute da raiz, um comando por vez:

```powershell
dotnet test tests/UnitTests/UnitTests.csproj -c Release
```

Alternativa aos unitários sem SDK local:

```powershell
docker build --target tests -f backend/Dockerfile -t joya-backend-testes .
```

Integração real, em ambiente separado:

```powershell
docker compose --progress plain -f docker-compose.tests.yml run --build --rm integration-tests
```

Não execute duas suítes ao mesmo tempo no mesmo banco de testes. Se alterar o contrato consumido pela UI, confira também `npm --prefix frontend test` e `npm --prefix frontend run build`.

Se build, teste ou acesso falhar, pare a etapa e explique a causa. Quando o terminal do agente não acessar Docker, forneça o comando exato ao usuário e aguarde o resultado; preparação ou revisão não conta como teste executado.

## Encerrar a etapa

Revise o diff e execute `git diff --check`. Atualize spec, plano ou README somente no que mudou. Informe o comportamento entregue, os testes realmente executados e as limitações. Faça commit e confirme o push conforme autorização e fluxo de `AGENTS.md`, preservando o histórico. Nunca atribua uso automático desta skill ou de outro cliente sem evidência.
