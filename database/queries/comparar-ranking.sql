-- Executar exclusivamente pelo serviço query-analysis do Compose de testes.
-- Só cria tabelas temporárias de sessão; não modifica as tabelas da aplicação.
SET NOCOUNT ON;
SET XACT_ABORT ON;
SELECT @@VERSION AS VersaoSql;

CREATE TABLE #Clientes (Id int NOT NULL PRIMARY KEY, Nome nvarchar(160) NOT NULL);
CREATE TABLE #Pedidos (Id bigint NOT NULL PRIMARY KEY, ClienteId int NOT NULL, DataPedido datetime2(7) NOT NULL);
CREATE TABLE #ItensPedido (PedidoId bigint NOT NULL, ProdutoId int NOT NULL,
    Quantidade int NOT NULL, PrecoUnitario decimal(18,2) NOT NULL,
    PRIMARY KEY (PedidoId, ProdutoId));
-- Mesma ordem de chaves dos índices relevantes do schema de produção.
CREATE INDEX IX_Pedidos_Data_Cliente ON #Pedidos(DataPedido, ClienteId);
CREATE INDEX IX_Pedidos_Cliente_Data ON #Pedidos(ClienteId, DataPedido);

INSERT #Clientes VALUES (1,N'Ana Silva'),(2,N'Ana Silva'),(3,N'Bruno Costa'),
    (4,N'Carla Lima'),(5,N'Diego Souza'),(6,N'Eva Santos');
INSERT #Pedidos VALUES
    (1,1,'2025-12-31T23:59:59.9999999'), (2,1,'2026-01-01T00:00:00'),
    (3,2,'2026-06-15T12:00:00'), (4,3,'2026-12-31T23:59:59.9999999'),
    (5,4,'2027-01-01T00:00:00'), (6,5,'2026-11-01T09:00:00');
INSERT #ItensPedido SELECT Id,1,ClienteId,149.90 FROM #Pedidos;

DECLARE @Inicio datetime2(7) = '2026-01-01', @Fim datetime2(7) = '2027-01-01';
SELECT c.Nome, SUM(i.Quantidade * i.PrecoUnitario) AS Total
INTO #Original
FROM #Clientes c
LEFT JOIN #Pedidos p ON p.ClienteId=c.Id
LEFT JOIN #ItensPedido i ON i.PedidoId=p.Id
WHERE YEAR(p.DataPedido)=2026
GROUP BY c.Nome;

SELECT TOP (5) c.Id AS ClienteId,c.Nome,SUM(i.Quantidade*i.PrecoUnitario) AS Total
INTO #Corrigida
FROM #Pedidos p JOIN #Clientes c ON c.Id=p.ClienteId
JOIN #ItensPedido i ON i.PedidoId=p.Id
WHERE p.DataPedido>=@Inicio AND p.DataPedido<@Fim
GROUP BY c.Id,c.Nome ORDER BY Total DESC,c.Id;

DECLARE @Esperado TABLE(ClienteId int,Nome nvarchar(160),Total decimal(38,2));
INSERT @Esperado VALUES (5,N'Diego Souza',749.50),(3,N'Bruno Costa',449.70),
    (2,N'Ana Silva',299.80),(1,N'Ana Silva',149.90);
IF EXISTS (SELECT ClienteId,Nome,Total FROM #Corrigida EXCEPT SELECT * FROM @Esperado)
 OR EXISTS (SELECT * FROM @Esperado EXCEPT SELECT ClienteId,Nome,Total FROM #Corrigida)
    THROW 51000, 'Ranking corrigido diverge do esperado nas fronteiras de 2026.', 1;
IF NOT EXISTS (SELECT 1 FROM #Original WHERE Nome=N'Ana Silva' AND Total=449.70)
    THROW 51001, 'Fixture não demonstrou mistura de homônimos na original.', 1;
PRINT 'CORRECAO: PASSOU - homonimos separados, inicio incluido e fim excluido.';
SELECT N'Original: ascendente e homonimos misturados' AS Consulta,Nome,Total FROM #Original ORDER BY Total;
SELECT N'Corrigida' AS Consulta,* FROM #Corrigida ORDER BY Total DESC,ClienteId;

-- Sétimo cliente e empate forçam exclusão do sexto colocado pelo TOP (5).
INSERT #Clientes VALUES(7,N'Gabi');
INSERT #Pedidos VALUES(7,4,'2026-02-01'),(8,6,'2026-02-01'),(9,7,'2026-02-01');
INSERT #ItensPedido VALUES(7,1,2,149.90),(8,1,2,149.90),(9,1,1,149.90);
DELETE #Corrigida;
INSERT #Corrigida
SELECT TOP (5) c.Id,c.Nome,SUM(i.Quantidade*i.PrecoUnitario)
FROM #Pedidos p JOIN #Clientes c ON c.Id=p.ClienteId
JOIN #ItensPedido i ON i.PedidoId=p.Id
WHERE p.DataPedido>=@Inicio AND p.DataPedido<@Fim
GROUP BY c.Id,c.Nome ORDER BY SUM(i.Quantidade*i.PrecoUnitario) DESC,c.Id;
IF (SELECT COUNT(*) FROM #Corrigida)<>5 OR EXISTS(SELECT 1 FROM #Corrigida WHERE ClienteId IN(1,7))
    THROW 51002, 'TOP (5) ou desempate incorreto.', 1;
PRINT 'TOP5: PASSOU - cinco clientes e desempate por Id.';

-- Benchmark sintético independente do seed, sem alterar dados reais.
TRUNCATE TABLE #ItensPedido;
TRUNCATE TABLE #Pedidos;
TRUNCATE TABLE #Clientes;
;WITH D(n) AS (SELECT n FROM (VALUES(0),(1),(2),(3),(4),(5),(6),(7),(8),(9)) v(n)),
Numeros AS (SELECT TOP(1000) ROW_NUMBER() OVER(ORDER BY (SELECT NULL)) AS n FROM D a CROSS JOIN D b CROSS JOIN D c)
INSERT #Clientes SELECT n,CASE WHEN n IN(1,2) THEN N'Homonimo' ELSE CONCAT(N'Cliente ',n) END FROM Numeros;
;WITH D(n) AS (SELECT n FROM (VALUES(0),(1),(2),(3),(4),(5),(6),(7),(8),(9)) v(n)),
Numeros AS (SELECT ROW_NUMBER() OVER(ORDER BY (SELECT NULL)) AS n FROM D a CROSS JOIN D b CROSS JOIN D c CROSS JOIN D d CROSS JOIN D e)
INSERT #Pedidos SELECT n,1+(n%1000),DATEADD(DAY,CONVERT(int,n%3652),CONVERT(datetime2(7),'2018-01-01')) FROM Numeros;
INSERT #ItensPedido SELECT Id,1,CONVERT(int,1+(Id%5)),149.90 FROM #Pedidos;
UPDATE STATISTICS #Clientes WITH FULLSCAN;
UPDATE STATISTICS #Pedidos WITH FULLSCAN;
UPDATE STATISTICS #ItensPedido WITH FULLSCAN;
SELECT COUNT(*) AS Pedidos, SUM(CASE WHEN DataPedido>=@Inicio AND DataPedido<@Fim THEN 1 ELSE 0 END) AS Pedidos2026 FROM #Pedidos;

DECLARE @OriginalSql nvarchar(max)=N'
SELECT c.Nome,SUM(i.Quantidade*i.PrecoUnitario) AS Total
FROM #Clientes c LEFT JOIN #Pedidos p ON p.ClienteId=c.Id
LEFT JOIN #ItensPedido i ON i.PedidoId=p.Id
WHERE YEAR(p.DataPedido)=2026 GROUP BY c.Nome ORDER BY Total;';
DECLARE @YearSql nvarchar(max)=N'
SELECT TOP(5) c.Id,c.Nome,SUM(i.Quantidade*i.PrecoUnitario) AS Total
FROM #Pedidos p JOIN #Clientes c ON c.Id=p.ClienteId
JOIN #ItensPedido i ON i.PedidoId=p.Id
WHERE YEAR(p.DataPedido)=2026 GROUP BY c.Id,c.Nome ORDER BY Total DESC,c.Id;';
DECLARE @RangeSql nvarchar(max)=N'
SELECT TOP(5) c.Id,c.Nome,SUM(i.Quantidade*i.PrecoUnitario) AS Total
FROM #Pedidos p JOIN #Clientes c ON c.Id=p.ClienteId
JOIN #ItensPedido i ON i.PedidoId=p.Id
WHERE p.DataPedido>=@Inicio AND p.DataPedido<@Fim
GROUP BY c.Id,c.Nome ORDER BY Total DESC,c.Id;';

CREATE TABLE #YearControle(Id int,Nome nvarchar(160),Total decimal(38,2));
CREATE TABLE #RangeControle(Id int,Nome nvarchar(160),Total decimal(38,2));
INSERT #YearControle EXEC sys.sp_executesql @YearSql;
INSERT #RangeControle EXEC sys.sp_executesql @RangeSql,N'@Inicio datetime2(7),@Fim datetime2(7)',@Inicio,@Fim;
IF EXISTS(SELECT * FROM #YearControle EXCEPT SELECT * FROM #RangeControle)
 OR EXISTS(SELECT * FROM #RangeControle EXCEPT SELECT * FROM #YearControle)
    THROW 51003, 'Controles YEAR e intervalo produziram resultados diferentes.', 1;
PRINT 'CONTROLE: PASSOU - YEAR e intervalo retornam os mesmos cinco clientes e totais.';

-- Aquecimento, sem limpar cache compartilhado ou forçar índices/planos.
EXEC sys.sp_executesql @OriginalSql;
EXEC sys.sp_executesql @YearSql;
EXEC sys.sp_executesql @RangeSql,N'@Inicio datetime2(7),@Fim datetime2(7)',@Inicio,@Fim;

PRINT 'MEDICOES: tres rodadas; PROFILE na primeira fornece plano real tabular.';
PRINT 'YEAR_CONTROLE e INTERVALO possuem a mesma semantica; comparar ambos isola o predicado.';
DECLARE @Rodada int=1;
WHILE @Rodada<=3
BEGIN
    PRINT CONCAT('RODADA ',@Rodada);
    IF @Rodada=1 SET STATISTICS PROFILE ON;
    SET STATISTICS IO ON;
    SET STATISTICS TIME ON;
    IF @Rodada%2=1
    BEGIN
        PRINT 'CONSULTA ORIGINAL'; EXEC sys.sp_executesql @OriginalSql;
        PRINT 'CONSULTA YEAR_CONTROLE'; EXEC sys.sp_executesql @YearSql;
        PRINT 'CONSULTA INTERVALO'; EXEC sys.sp_executesql @RangeSql,N'@Inicio datetime2(7),@Fim datetime2(7)',@Inicio,@Fim;
    END
    ELSE
    BEGIN
        PRINT 'CONSULTA INTERVALO'; EXEC sys.sp_executesql @RangeSql,N'@Inicio datetime2(7),@Fim datetime2(7)',@Inicio,@Fim;
        PRINT 'CONSULTA YEAR_CONTROLE'; EXEC sys.sp_executesql @YearSql;
        PRINT 'CONSULTA ORIGINAL'; EXEC sys.sp_executesql @OriginalSql;
    END
    SET STATISTICS PROFILE OFF;
    SET STATISTICS TIME OFF;
    SET STATISTICS IO OFF;
    SET @Rodada+=1;
END;
PRINT 'FIM: comparar leituras logicas, CPU, duracao, linhas reais/estimadas e operadores; sem pressupor ganho.';
