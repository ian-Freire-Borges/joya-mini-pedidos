# Decisões adotadas

Todas abaixo propostas pelo Codex e adotadas na implementação; não representam correções solicitadas por Ian.

| Decisão | Motivo |
|---|---|
| .NET 10 LTS | Suporte vigente; .NET 8 encerrou suporte em 10/11/2026 |
| SQL autoritativo, EF só mapeia | Mesmos scripts em Compose e testes; sem migrations paralelas |
| UPDATE condicional e OUTPUT de preço | Evita consulta seguida de baixa sem lock e captura preço atomicamente |
| Produtos por Id crescente | Reduz inversão de ordem de locks; deadlocks ainda devem retornar conflito |
| Duplicatas rejeitadas | Regra simples e inequívoca; sem estouro por soma |
| UTC e fim exclusivo | Evita perda de frações no último dia |
| SQL MCP Server Microsoft/DAB | Fornecedor oficial, suporte SQL Server e transporte HTTP; pendente executar |
| Não publicar remoto | Autorização explícita ainda ausente |

Fontes oficiais consultadas: https://dotnet.microsoft.com/en-us/platform/support/policy ; https://learn.microsoft.com/en-us/azure/data-api-builder/mcp/overview .
