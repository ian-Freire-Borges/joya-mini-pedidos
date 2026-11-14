namespace Pedidos.Api;

public sealed record CriarPedido(int ClienteId, List<CriarItem>? Itens);
