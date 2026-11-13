-- Fonte de verdade do schema. Não usar EnsureCreated/migrations EF.
IF DB_ID(N'JoyaPedidos') IS NULL CREATE DATABASE JoyaPedidos;
GO
USE JoyaPedidos;
GO
SET XACT_ABORT ON;
BEGIN TRANSACTION;
IF OBJECT_ID(N'dbo.Clientes', N'U') IS NULL
CREATE TABLE dbo.Clientes (
 Id int NOT NULL CONSTRAINT PK_Clientes PRIMARY KEY,
 Nome nvarchar(160) NOT NULL CONSTRAINT CK_Clientes_Nome CHECK (LEN(LTRIM(RTRIM(Nome))) > 0)
);
IF OBJECT_ID(N'dbo.Produtos', N'U') IS NULL
CREATE TABLE dbo.Produtos (
 Id int NOT NULL CONSTRAINT PK_Produtos PRIMARY KEY,
 Nome nvarchar(160) NOT NULL CONSTRAINT CK_Produtos_Nome CHECK (LEN(LTRIM(RTRIM(Nome))) > 0),
 Preco decimal(18,2) NOT NULL CONSTRAINT CK_Produtos_Preco CHECK (Preco BETWEEN 0.01 AND 999999.99),
 Estoque int NOT NULL CONSTRAINT CK_Produtos_Estoque CHECK (Estoque BETWEEN 0 AND 1000000)
);
IF OBJECT_ID(N'dbo.Pedidos', N'U') IS NULL
CREATE TABLE dbo.Pedidos (
 Id bigint IDENTITY NOT NULL CONSTRAINT PK_Pedidos PRIMARY KEY,
 ClienteId int NOT NULL CONSTRAINT FK_Pedidos_Clientes REFERENCES dbo.Clientes(Id),
 DataPedido datetime2(7) NOT NULL CONSTRAINT DF_Pedidos_Data DEFAULT SYSUTCDATETIME()
);
IF OBJECT_ID(N'dbo.ItensPedido', N'U') IS NULL
CREATE TABLE dbo.ItensPedido (
 PedidoId bigint NOT NULL CONSTRAINT FK_ItensPedido_Pedidos REFERENCES dbo.Pedidos(Id),
 ProdutoId int NOT NULL CONSTRAINT FK_ItensPedido_Produtos REFERENCES dbo.Produtos(Id),
 Quantidade int NOT NULL CONSTRAINT CK_ItensPedido_Quantidade CHECK (Quantidade BETWEEN 1 AND 10000),
 PrecoUnitario decimal(18,2) NOT NULL CONSTRAINT CK_ItensPedido_Preco CHECK (PrecoUnitario BETWEEN 0.01 AND 999999.99),
 CONSTRAINT PK_ItensPedido PRIMARY KEY (PedidoId,ProdutoId)
);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID('dbo.Pedidos') AND name='IX_Pedidos_Data_Cliente')
CREATE INDEX IX_Pedidos_Data_Cliente ON dbo.Pedidos(DataPedido,ClienteId);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID('dbo.Pedidos') AND name='IX_Pedidos_Cliente_Data')
CREATE INDEX IX_Pedidos_Cliente_Data ON dbo.Pedidos(ClienteId,DataPedido);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID('dbo.ItensPedido') AND name='IX_ItensPedido_Produto')
CREATE INDEX IX_ItensPedido_Produto ON dbo.ItensPedido(ProdutoId);
-- PK de ItensPedido começa com PedidoId e já cobre essa FK.
IF OBJECT_ID(N'dbo.SchemaVersions',N'U') IS NULL CREATE TABLE dbo.SchemaVersions(Versao int NOT NULL PRIMARY KEY);
IF NOT EXISTS(SELECT 1 FROM dbo.SchemaVersions WHERE Versao=1) INSERT dbo.SchemaVersions VALUES(1);
COMMIT;
GO
