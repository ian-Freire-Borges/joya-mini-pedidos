USE JoyaPedidos;
GO
SET XACT_ABORT ON;
BEGIN TRANSACTION;
IF OBJECT_ID(N'dbo.SeedVersions',N'U') IS NULL CREATE TABLE dbo.SeedVersions(Versao int NOT NULL PRIMARY KEY);
IF NOT EXISTS(SELECT 1 FROM dbo.SeedVersions WITH (UPDLOCK,HOLDLOCK) WHERE Versao=1)
BEGIN
 INSERT dbo.Clientes(Id,Nome) SELECT v.Id,v.Nome FROM (VALUES (1,N'Ana Silva'),(2,N'Ana Silva'),(3,N'Bruno Costa'),(4,N'Carla Lima'),(5,N'Diego Souza'),(6,N'Eva Santos')) v(Id,Nome) WHERE NOT EXISTS(SELECT 1 FROM dbo.Clientes c WHERE c.Id=v.Id);
 INSERT dbo.Produtos(Id,Nome,Preco,Estoque) SELECT v.Id,v.Nome,v.Preco,v.Estoque FROM (VALUES (1,N'Teclado',149.90,50),(2,N'Mouse',89.50,80),(3,N'Monitor',999.99,20),(4,N'Headset',199.90,30)) v(Id,Nome,Preco,Estoque) WHERE NOT EXISTS(SELECT 1 FROM dbo.Produtos p WHERE p.Id=v.Id);
 -- Histórico demonstrativo anterior ao estoque inicial disponível. Não reduz o saldo atual.
 DECLARE @Novos TABLE(Id bigint,ClienteId int);
 INSERT dbo.Pedidos(ClienteId,DataPedido) OUTPUT inserted.Id,inserted.ClienteId INTO @Novos
 SELECT ClienteId,CONVERT(datetime2(7),DataISO,126) FROM (VALUES
 (1,'2025-12-31T23:59:59.9999999'),(1,'2026-01-01T00:00:00.0000000'),
 (2,'2026-06-15T12:00:00.0000000'),(3,'2026-12-31T23:59:59.9999999'),
 (4,'2027-01-01T00:00:00.0000000'),(5,'2026-11-01T09:00:00.0000000')) v(ClienteId,DataISO);
 INSERT dbo.ItensPedido(PedidoId,ProdutoId,Quantidade,PrecoUnitario) SELECT Id,1,ClienteId,149.90 FROM @Novos;
 INSERT dbo.SeedVersions VALUES(1);
END
COMMIT;
GO
