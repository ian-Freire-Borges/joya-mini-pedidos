using Microsoft.AspNetCore.Diagnostics;
using Microsoft.Data.SqlClient;

namespace Pedidos.Api;

public static class ApiErrors
{
    public static WebApplication UseApiErrors(this WebApplication app)
    {
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
        return app;
    }
}
