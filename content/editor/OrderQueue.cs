namespace Shop.Processing;

public sealed class OrderQueue
{
    private readonly Channel<OrderPlaced> _channel =
        Channel.CreateBounded<OrderPlaced>(new BoundedChannelOptions(1_000)
        {
            FullMode = BoundedChannelFullMode.Wait,
            SingleReader = true,
        });

    public ValueTask EnqueueAsync(OrderPlaced evt, CancellationToken ct) =>
        _channel.Writer.WriteAsync(evt, ct);

    public IAsyncEnumerable<OrderPlaced> ReadAllAsync(CancellationToken ct) =>
        _channel.Reader.ReadAllAsync(ct);
}

public sealed class OrderProcessor(OrderQueue queue, IMailer mailer)
    : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        await foreach (var evt in queue.ReadAllAsync(ct))
        {
            ⟨|await |later⟩mailer.SendConfirmationAsync(evt.OrderId, ct);
        }
    }
}
