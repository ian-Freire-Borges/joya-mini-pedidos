namespace Pedidos.Api;

public sealed record PaginaDto<T>(List<T> Itens, int Pagina, int Tamanho, int TotalRegistros)
{ public int TotalPaginas => (int)Math.Ceiling((decimal)TotalRegistros / Tamanho); }
