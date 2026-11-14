namespace Pedidos.Api;

public sealed record PedidoDto(long Id, int ClienteId, string ClienteNome, DateTime DataPedido, List<ItemDto> Itens)
{ public decimal Total => Itens.Sum(i => i.Subtotal); }
