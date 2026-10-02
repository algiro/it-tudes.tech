namespace Resilience;

public static class Retry
{
    /// <summary>Retries transient HTTP failures with exponential backoff and jitter.</summary>
    public static async Task<T> WithBackoffAsync<T>(
        Func<CancellationToken, Task<T>> action,
        int maxAttempts = 4,
        CancellationToken ct = default)
    {
        for (var attempt = 1; ; attempt++)
        {
            try
            {
                return await action(ct);
            }
            catch (HttpRequestException) when (attempt ⟨<=|<⟩ maxAttempts)
            {
                var delay = TimeSpan.FromMilliseconds(
                    Math.Pow(2, attempt) * 100 + Random.Shared.Next(0, 100));
                await Task.Delay(delay, ct);
            }
        }
    }
}
