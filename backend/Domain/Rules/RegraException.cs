namespace Pedidos.Api;

public sealed class RegraException(int status, string message) : Exception(message) { public int Status => status; }
