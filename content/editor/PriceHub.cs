namespace Aisles.Realtime;

public interface IPriceClient
{
    Task PriceChanged(string productId, decimal newPrice);
}

[Authorize]
public sealed class PriceHub : Hub<IPriceClient>
{
    public Task Watch(string productId) =>
        Groups.AddToGroupAsync(Context.ConnectionId, ⟨productId|GroupFor(productId)⟩);

    public Task Unwatch(string productId) =>
        Groups.RemoveFromGroupAsync(Context.ConnectionId, GroupFor(productId));

    public static string GroupFor(string productId) => $"product:{productId}";
}

public sealed class PriceNotifier(IHubContext<PriceHub, IPriceClient> hub)
{
    public Task NotifyAsync(string productId, decimal price) =>
        hub.Clients.Group(PriceHub.GroupFor(productId))
            .PriceChanged(productId, price);
}
