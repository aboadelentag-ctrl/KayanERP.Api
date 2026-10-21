using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace KayanERP.Api.Middleware; // ✅ تم توحيد الـ Namespace

/// <summary>
/// Global exception handling middleware.
/// Catches all unhandled exceptions, logs them with a correlation id,
/// and returns a unified JSON error response to the client.
/// </summary>
public sealed class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;
    private readonly IHostEnvironment _env;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger,
        IHostEnvironment env)
    {
        _next = next ?? throw new ArgumentNullException(nameof(next));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _env = env ?? throw new ArgumentNullException(nameof(env));
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

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var traceId = context.TraceIdentifier;

        // Log the full exception with correlation id
        _logger.LogError(
            exception,
            "Unhandled exception. TraceId: {TraceId}, Path: {Path}, Method: {Method}",
            traceId,
            context.Request.Path,
            context.Request.Method);

        var (statusCode, errorCode, message) = MapException(exception);

        var response = new ErrorResponse
        {
            TraceId = traceId,
            ErrorCode = errorCode,
            Message = message,
            // In Development only: include exception detail for faster debugging.
            Details = _env.IsDevelopment() ? exception.ToString() : null
        };

        if (context.Response.HasStarted)
        {
            _logger.LogWarning(
                "Response already started, cannot write error response. TraceId: {TraceId}", traceId);
            return;
        }

        context.Response.Clear();
        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json; charset=utf-8";

        var json = JsonSerializer.Serialize(response, JsonOptions);
        await context.Response.WriteAsync(json);
    }

    /// <summary>
    /// Maps an exception to (HTTP status, business error code, safe user message).
    /// Extend this method as new domain exceptions are introduced.
    /// </summary>
    private static (int statusCode, string errorCode, string message) MapException(Exception exception)
    {
        return exception switch
        {
            ArgumentNullException or ArgumentException =>
                ((int)HttpStatusCode.BadRequest, "INVALID_ARGUMENT", exception.Message),

            UnauthorizedAccessException =>
                ((int)HttpStatusCode.Unauthorized, "UNAUTHORIZED", "You are not authorized to perform this action."),

            KeyNotFoundException =>
                ((int)HttpStatusCode.NotFound, "NOT_FOUND", exception.Message),

            InvalidOperationException =>
                ((int)HttpStatusCode.Conflict, "INVALID_OPERATION", exception.Message),

            TimeoutException =>
                ((int)HttpStatusCode.GatewayTimeout, "TIMEOUT", "The operation timed out. Please try again."),

            _ => ((int)HttpStatusCode.InternalServerError, "INTERNAL_ERROR",
                  "An unexpected error occurred. Please contact support with the trace id.")
        };
    }
}

/// <summary>
/// Unified error payload returned to the client for all unhandled exceptions.
/// </summary>
public sealed class ErrorResponse
{
    public string TraceId { get; set; } = default!;
    public string ErrorCode { get; set; } = default!;
    public string Message { get; set; } = default!;
    public string? Details { get; set; }
}