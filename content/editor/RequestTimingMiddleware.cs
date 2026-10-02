namespace Shop.Api.Infrastructure;

public sealed class RequestTimingMiddleware(
    RequestDelegate next,
    ILogger<RequestTimingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        var started = Stopwatch.GetTimestamp();
        try
        {
            await next(context);
        }
        finally
        {
            var elapsed = Stopwatch.GetElapsedTime(started);
            if (elapsed > TimeSpan.FromMilliseconds(⟨50|500⟩))
            {
                logger.LogWarning(
                    "Slow request {Method} {Path} took {Elapsed} ms",
                    context.Request.Method,
                    context.Request.Path,
                    elapsed.TotalMilliseconds);
            }
        }
    }
}
