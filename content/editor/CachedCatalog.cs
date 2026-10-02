namespace Aisles.Catalog;

public sealed class CachedCatalog(IStoreCatalog inner, HybridCache cache)
    : IStoreCatalog
{
    private static readonly HybridCacheEntryOptions Entry = new()
    {
        Expiration = TimeSpan.FromMinutes(⟨5|30⟩),
        LocalCacheExpiration = TimeSpan.FromMinutes(5),
    };

    public async Task<IReadOnlyList<Offer>> GetOffersAsync(
        string productId, CancellationToken ct)
    {
        return await cache.GetOrCreateAsync(
            $"offers:{productId}",
            async token => await inner.GetOffersAsync(productId, token),
            Entry,
            tags: ["offers"],
            cancellationToken: ct);
    }

    public ValueTask InvalidateAsync(CancellationToken ct) =>
        cache.RemoveByTagAsync("offers", ct);
}
