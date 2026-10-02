namespace Ops.Health;

public sealed class DiskSpaceCheck : IHealthCheck
{
    public Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context, CancellationToken ct = default)
    {
        var drive = new DriveInfo("/");
        var freePercent = 100.0 * drive.AvailableFreeSpace / drive.TotalSize;

        var result = freePercent switch
        {
            < 10 => HealthCheckResult.Unhealthy($"Disk {freePercent:F0}% free"),
            < ⟨15|20⟩ => HealthCheckResult.Degraded($"Disk {freePercent:F0}% free"),
            _ => HealthCheckResult.Healthy(),
        };
        return Task.FromResult(result);
    }
}

public static class HealthSetup
{
    public static IHealthChecksBuilder AddOpsChecks(this IServiceCollection services) =>
        services.AddHealthChecks()
            .AddCheck<DiskSpaceCheck>("disk", tags: ["ready"]);
}
