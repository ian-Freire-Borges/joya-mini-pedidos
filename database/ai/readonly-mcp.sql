-- Somente no SQL Server descartável de docker-compose.tests.yml.
-- Credencial pública de demonstração; nunca reutilizar na hospedagem.
USE JoyaPedidos;
GO
CREATE OR ALTER VIEW dbo.McpTopClientes2026
AS
SELECT TOP (5) c.Id AS ClienteId, c.Nome,
       CONVERT(decimal(18,2), SUM(i.Quantidade * i.PrecoUnitario)) AS Total
FROM dbo.Clientes c
INNER JOIN dbo.Pedidos p ON p.ClienteId = c.Id
INNER JOIN dbo.ItensPedido i ON i.PedidoId = p.Id
WHERE p.DataPedido >= '20260101' AND p.DataPedido < '20270101'
GROUP BY c.Id, c.Nome
ORDER BY SUM(i.Quantidade * i.PrecoUnitario) DESC, c.Id ASC;
GO
IF NOT EXISTS (SELECT 1 FROM sys.server_principals WHERE name = N'joya_mcp_reader')
  CREATE LOGIN joya_mcp_reader WITH PASSWORD = 'JoyaMcpReadOnly!2026', CHECK_POLICY = ON;
IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = N'joya_mcp_reader')
  CREATE USER joya_mcp_reader FOR LOGIN joya_mcp_reader;
GRANT SELECT ON OBJECT::dbo.McpTopClientes2026 TO joya_mcp_reader;
GRANT VIEW DEFINITION ON OBJECT::dbo.McpTopClientes2026 TO joya_mcp_reader;
GO
EXECUTE AS USER = 'joya_mcp_reader';
IF HAS_PERMS_BY_NAME('dbo.Produtos', 'OBJECT', 'UPDATE') = 1
   OR HAS_PERMS_BY_NAME('dbo.Pedidos', 'OBJECT', 'INSERT') = 1
   OR HAS_PERMS_BY_NAME('dbo.Pedidos', 'OBJECT', 'DELETE') = 1
BEGIN
  REVERT;
  THROW 51000, 'Usuario MCP possui permissao de escrita inesperada.', 1;
END;
SELECT ClienteId, Nome, Total FROM dbo.McpTopClientes2026 ORDER BY Total DESC, ClienteId;
REVERT;
GO
