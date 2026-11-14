# Especificação — Mini Gestão de Pedidos

Data: 13/11/2026. Implementação assistida por agente de IA.
Prazo informado: 15/11/2026 16h; fuso do e-mail não confirmado. Não foi enviada mensagem à recrutadora.

## Objetivo e escopo
Cadastrar pedidos, consultar pedidos paginados e classificar os cinco clientes de maior valor comprado em um período. Clientes e produtos são dados de referência. Sem autenticação, pagamentos, edição ou cancelamento de pedidos.

## Modelo e regras
- Cliente(Id PK, Nome NOT NULL nvarchar(160)); nomes podem repetir.
- Produto(Id PK, Nome NOT NULL nvarchar(160), Preco decimal(18,2), Estoque int).
- Pedido(Id PK bigint identity, ClienteId FK, DataPedido datetime2 UTC).
- ItemPedido(PedidoId FK, ProdutoId FK, Quantidade int, PrecoUnitario decimal(18,2)); PK composta.
- Preço: de 0,01 até 999.999,99; estoque entre 0 e 1.000.000. Quantidade entre 1 e 10.000; até 100 itens distintos. Itens repetidos são rejeitados, sem consolidação.
- Preços têm duas casas; não há desconto nem cálculo fracionário de quantidade. Produtos monetários usam decimal. Total é soma exata de preço com duas casas vezes quantidade inteira, limitado pelos limites acima. Se futuramente houver operação fracionária, usar MidpointRounding.AwayFromZero.
- API não recebe preço/total como campos do contrato; obtém preço no servidor e grava a fotografia no item.
- Cliente/produto inexistente: 404; corpo/regras inválidas: 400; estoque/concorrrência: 409; inesperado: 500 sem detalhes internos.
- Transação única para pedido, itens e estoque. Atualização SQL condicional `Estoque >= quantidade`, com preço obtido em UPDATE OUTPUT; produtos processados por Id ascendente. Rollback integral se qualquer produto falhar. SQL Server mantém locks de atualização até commit; um comprador concorrente espera e reavalia o predicado.

## Contratos HTTP
Base pública `/api`, preservada pelo proxy e interpretada por UsePathBase; rotas internas sem prefixo. Location usa PathBase e caminho absoluto no host.
- GET /clientes: [{id,nome}]. GET /produtos: [{id,nome,preco,estoque}].
- POST /pedidos: {"clienteId":1,"itens":[{"produtoId":1,"quantidade":2}]}. 201: {id,clienteId,clienteNome,dataPedido,total,itens:[{produtoId,produtoNome,quantidade,precoUnitario,subtotal}]}. Location aponta GET /pedidos/{id}.
- GET /pedidos/{id}: mesmo DTO; 404 quando ausente.
- GET /pedidos?clienteId=1&inicio=2026-01-01&fim=2027-01-01&pagina=1&tamanho=10: {itens,pagina,tamanho,totalRegistros,totalPaginas}. Pagina >=1 até 1.000.000; tamanho de 1 até 100. Ordenação DataPedido DESC, Id DESC. SQL OFFSET/FETCH via EF.
- GET /relatorios/top-clientes?inicio=2026-01-01&fim=2027-01-01: [{clienteId,nome,total}], até 5, total DESC e clienteId ASC.
- Erros: application/problem+json, status, title português, detail seguro, traceId quando disponível.

## Datas
Instantes gravados em UTC. Query aceita datas ISO yyyy-MM-dd interpretadas como meia-noite UTC. Início inclusivo, fim exclusivo; início >= fim retorna 400. Filtros ausentes não restringem. UI mostra datas do calendário UTC; converte dia final inclusivo escolhido para dia seguinte em UTC. Limite superior UI 9998-12-31 para conversão segura.

## Aceite
1. Docker sobe SQL Server real, inicializador, API e UI por healthchecks e depends_on.
2. Criar pedido persiste fotografia e estoque atomicamente; falhas não deixam mudanças parciais; concorrência não vende estoque inexistente.
3. Filtros e paginação são executados no banco; ranking preserva clientes homônimos e fronteiras do período.
4. UI acessível trata carregamento, vazio, erros, vários itens e envio único.
5. Testes unitários e integração real, documentação e evidências distinguem preparação e execução.
6. Configuração AI First e MCP devem ter evidência de uso real. A assistência é realizada por agente de IA, conforme orientação de Ian; registrar o mecanismo efetivamente utilizado.

## Decisões abertas
Vídeo e revisão final de entrega. MCP utilizado pelo agente via cliente diagnóstico e medições SQL históricas documentadas no README. Identidade Git confirmada como Ian Freire Borges / ianxofreire@gmail.com; repositório privado e deploy foram autorizados e realizados.
