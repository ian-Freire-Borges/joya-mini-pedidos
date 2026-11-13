using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Pedidos.Api;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<PedidosDb>(o => o.UseSqlServer(builder.Configuration.GetConnectionString("Pedidos") ?? throw new InvalidOperationException("ConnectionStrings__Pedidos deve ser configurada.")));
builder.Services.AddScoped<PedidosService>();
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddOpenApi();
builder.Services.AddProblemDetails();
builder.Services.ConfigureHttpJsonOptions(o => o.SerializerOptions.UnmappedMemberHandling = System.Text.Json.Serialization.JsonUnmappedMemberHandling.Disallow);
builder.Services.Configure<RouteHandlerOptions>(o => o.ThrowOnBadRequest = true);
var app = builder.Build();
// Nginx preserva /api; PathBase permite gerar Location correta também atrás do proxy.
app.UsePathBase("/api");
app.UseExceptionHandler(handler => handler.Run(async context =>
{
    var ex = context.Features.Get<IExceptionHandlerFeature>()!.Error;
    var sql = ex as SqlException ?? ex.InnerException as SqlException;
    var status = ex switch { RegraException r => r.Status, BadHttpRequestException => 400, _ when sql?.Number is 1205 or 1222 => 409, _ => 500 };
    var detail = ex is RegraException regra ? regra.Message : status == 400 ? "Confira os campos enviados e os formatos de datas e números." : status == 409 ? "Conflito de concorrência. Tente novamente." : "Falha inesperada. Tente novamente mais tarde.";
    if (status == 500) app.Logger.LogError(ex, "Erro inesperado {TraceId}", context.TraceIdentifier);
    await Results.Problem(statusCode: status, title: status switch { 400 => "Dados inválidos", 404 => "Recurso não encontrado", 409 => "Conflito de estoque", _ => "Erro interno" }, detail: detail,
        extensions: new Dictionary<string, object?> { ["traceId"] = context.TraceIdentifier }).ExecuteAsync(context);
}));
app.UseStatusCodePages(async context => await Results.Problem(statusCode: context.HttpContext.Response.StatusCode, title: "Requisição não atendida").ExecuteAsync(context.HttpContext));
app.MapOpenApi();
app.MapGet("/health", async (PedidosDb db, CancellationToken ct) => await db.Database.CanConnectAsync(ct) ? Results.Ok(new { status = "ok" }) : Results.StatusCode(503));
app.MapGet("/clientes", async (PedidosDb db, CancellationToken ct) => await db.Clientes.AsNoTracking().OrderBy(x => x.Nome).ThenBy(x => x.Id).ToListAsync(ct));
app.MapGet("/produtos", async (PedidosDb db, CancellationToken ct) => await db.Produtos.AsNoTracking().OrderBy(x => x.Nome).ThenBy(x => x.Id).ToListAsync(ct));
app.MapGet("/pedidos/{id:long}", async (long id, PedidosService service, CancellationToken ct) => await service.Obter(id, ct) is { } pedido ? Results.Ok(pedido) : Results.Problem(statusCode: 404, title: "Pedido não encontrado"));
app.MapPost("/pedidos", async (CriarPedido entrada, PedidosService service, HttpRequest request, CancellationToken ct) => { var p = await service.Criar(entrada, ct); return Results.Created($"{request.PathBase}/pedidos/{p.Id}", p); });
app.MapGet("/pedidos", async (PedidosService service, CancellationToken ct, int? clienteId = null, string? inicio = null, string? fim = null, int pagina = 1, int tamanho = 10) => await service.Listar(clienteId, RegrasPedido.LerData(inicio), RegrasPedido.LerData(fim), pagina, tamanho, ct));
app.MapGet("/relatorios/top-clientes", async (PedidosService service, CancellationToken ct, string? inicio = null, string? fim = null) => await service.Ranking(RegrasPedido.LerData(inicio), RegrasPedido.LerData(fim), ct));
app.Run();
public partial class Program { }
