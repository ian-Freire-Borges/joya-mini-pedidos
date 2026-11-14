namespace Pedidos.Api;

public sealed record ItemDto(int ProdutoId, string ProdutoNome, int Quantidade, decimal PrecoUnitario)
{ public decimal Subtotal => Quantidade * PrecoUnitario; }
