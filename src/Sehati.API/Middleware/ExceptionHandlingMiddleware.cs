using System.Net;
using System.Text.Json;
using Sehati.Application.Common.Exceptions;

namespace Sehati.API.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;
    private readonly IHostEnvironment _environment;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger, IHostEnvironment environment)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var (statusCode, message, errors) = exception switch
        {
            ValidationException valEx => (
                HttpStatusCode.BadRequest,
                valEx.Message,
                (object?)valEx.Errors
            ),
            UnauthorizedException unauthEx => (
                HttpStatusCode.Unauthorized,
                unauthEx.Message,
                (object?)null
            ),
            ConflictException conflictEx => (
                HttpStatusCode.Conflict,
                conflictEx.Message,
                (object?)null
            ),
            NotFoundException notFoundEx => (
                HttpStatusCode.NotFound,
                notFoundEx.Message,
                (object?)null
            ),
            _ => (
                HttpStatusCode.InternalServerError,
                "An unexpected error occurred while processing your request.",
                (object?)null
            )
        };

        if (statusCode == HttpStatusCode.InternalServerError)
        {
            _logger.LogError(exception, "Unhandled server error processing request {Path}", context.Request.Path);
        }
        else
        {
            _logger.LogWarning("Handled application exception for {Path}: {Message}", context.Request.Path, exception.Message);
        }

        context.Response.StatusCode = (int)statusCode;

        var response = new
        {
            statusCode = context.Response.StatusCode,
            message,
            errors,
            details = _environment.IsDevelopment() && statusCode == HttpStatusCode.InternalServerError ? exception.Message : null,
            timestampUtc = DateTime.UtcNow
        };

        var json = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
        });

        return context.Response.WriteAsync(json);
    }
}
