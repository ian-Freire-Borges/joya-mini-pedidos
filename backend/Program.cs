using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pedidos.Api;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<PedidosDb>(o => o.UseSqlServer(builder.Configuration.GetConnectionString("Pedidos") ?? throw new InvalidOperationException("ConnectionStrings__Pedidos deve ser configurada.")));
builder.Services.AddScoped<PedidosConsultas>();
builder.Services.AddScoped<CriacaoPedidos>();
builder.Services.AddScoped<EstoquePedidos>();
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddOpenApi();
builder.Services.AddProblemDetails();
builder.Services.ConfigureHttpJsonOptions(o => o.SerializerOptions.UnmappedMemberHandling = System.Text.Json.Serialization.JsonUnmappedMemberHandling.Disallow);
builder.Services.Configure<RouteHandlerOptions>(o => o.ThrowOnBadRequest = true);
var app = builder.Build();
// Nginx preserva /api; PathBase permite gerar Location correta também atrás do proxy.
app.UsePathBase("/api");
app.UseApiErrors();
app.MapOpenApi();
app.MapSistemaEndpoints();
app.MapCatalogosEndpoints();
app.MapPedidosEndpoints();
app.MapRelatoriosEndpoints();
app.Run();
public partial class Program { }
