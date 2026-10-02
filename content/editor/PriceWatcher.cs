namespace Aisles.Worker;

public sealed class PriceWatcher(
    IStoreCatalog catalog,
    IAlertSender alerts,
    ILogger<PriceWatcher> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromHours(6));

        do
        {
            try
            {
                await CheckPricesAsync(stoppingToken);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                logger.LogError(ex, "Price check failed, retrying next run");
            }
        }
        while (await timer.WaitForNextTickAsync(stoppingToken));
    }

    private async Task CheckPricesAsync(CancellationToken ct)
    {
        await foreach (var drop in catalog.GetPriceDropsAsync(ct))
        {
            if (drop.Percent ⟨> 5|>= 5⟩)
                await alerts.SendAsync(drop, ct);
        }
    }
}
