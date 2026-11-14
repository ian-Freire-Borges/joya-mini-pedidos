# Instruções do projeto

Para criar, alterar ou revisar endpoints do backend, leia e aplique a skill do projeto em `.claude/skills/criar-endpoint/SKILL.md`. Ela orienta contratos, regras de pedidos, transação de estoque e testes; não concede permissões adicionais nem amplia o escopo solicitado.

Leia docs/spec.md, docs/plan.md e README.md. Não invente testes, uso de Claude ou métricas.
API .NET 10 em backend; UI React/TypeScript em frontend; schema SQL autoritativo em database.
Não use EnsureCreated nem migrations paralelas. Não substitua SQL Server por SQLite nos testes.
Dinheiro decimal(18,2); preços sempre do servidor. Itens repetidos são inválidos.
Baixa e pedido em transação única, atualização condicional, produtos por Id crescente.
Execute `dotnet test tests/UnitTests`, `dotnet test tests/IntegrationTests`, `npm --prefix frontend run build` quando ambiente disponível.
Nunca apague volumes existentes, publique remoto ou exponha segredos sem autorização.
Sem identidade Git confirmada, não invente autor nem e-mail para commits.

## Fluxo obrigatório confirmado por Ian
Uma etapa por vez: implementar, testar, documentar resultado, commit e push confirmado antes da próxima etapa.
Pare em erro ou teste bloqueado. Não acumule etapas ou commits sem push.
Nenhum merge sem testes aprovados e autorização do usuário.
O primeiro push privado foi explicitamente solicitado como checkpoint parcial. Preserve os commits anteriores; não reescreva histórico. Documentação consolidada no README; manter docs/spec.md e docs/plan.md exigidos no enunciado.
