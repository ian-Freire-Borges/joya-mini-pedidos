-- Datas UTC: início inclusivo e fim exclusivo. Clientes sem compras não entram.
DECLARE @Inicio datetime2(7) = '2026-01-01T00:00:00';
DECLARE @Fim datetime2(7) = '2027-01-01T00:00:00';

SELECT TOP (5) c.Id AS ClienteId, c.Nome,
       SUM(i.Quantidade * i.PrecoUnitario) AS Total
FROM dbo.Pedidos AS p
INNER JOIN dbo.Clientes AS c ON c.Id = p.ClienteId
INNER JOIN dbo.ItensPedido AS i ON i.PedidoId = p.Id
WHERE p.DataPedido >= @Inicio AND p.DataPedido < @Fim
GROUP BY c.Id, c.Nome
ORDER BY Total DESC, c.Id ASC;
