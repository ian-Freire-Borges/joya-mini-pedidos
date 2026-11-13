# Instruções do projeto

Leia docs/spec.md e docs/requirements-matrix.md. Não invente testes, uso de Claude ou métricas.
API .NET 10 em backend; UI React/TypeScript em frontend; schema SQL autoritativo em database.
Não use EnsureCreated nem migrations paralelas. Não substitua SQL Server por SQLite nos testes.
Dinheiro decimal(18,2); preços sempre do servidor. Itens repetidos são inválidos.
Baixa e pedido em transação única, atualização condicional, produtos por Id crescente.
Execute `dotnet test tests/UnitTests`, `dotnet test tests/IntegrationTests`, `npm --prefix frontend run build` quando ambiente disponível.
Nunca apague volumes existentes, publique remoto ou exponha segredos sem autorização.
Sem identidade Git confirmada, não invente autor nem e-mail para commits.
