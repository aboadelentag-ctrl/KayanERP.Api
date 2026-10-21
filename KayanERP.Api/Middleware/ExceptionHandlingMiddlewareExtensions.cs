namespace Microsoft.AspNetCore.Builder;

/// <summary>
/// Extension methods for registering custom middleware in the pipeline.
/// </summary>
public static class ExceptionHandlingMiddlewareExtensions
{
    /// <summary>
    /// Adds the global exception handling middleware.
    /// Must be registered FIRST in the pipeline so it can catch errors
    /// from all subsequent middleware.
    /// </summary>
    public static IApplicationBuilder UseExceptionHandling(this IApplicationBuilder app)
    {
        return app.UseMiddleware<KayanERP.Api.Middleware.ExceptionHandlingMiddleware>();
    }
}