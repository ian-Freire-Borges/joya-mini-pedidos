namespace Pedidos.Api;

public sealed class Pedido
{
    public long Id { get; set; }
    public int ClienteId { get; set; }
    public Cliente Cliente { get; set; } = null!;
    public DateTime DataPedido { get; set; }
    public List<ItemPedido> Itens { get; set; } = [];
}
