namespace Aisles.Scraping;

public sealed class StoreScraper(HttpClient http, IOptions<ScraperOptions> options)
{
    public async Task<IReadOnlyList<Offer>> ScrapeAsync(
        IEnumerable<Store> stores, string query, CancellationToken ct)
    {
        var offers = new ConcurrentBag<Offer>();
        var parallel = new ParallelOptions
        {
            MaxDegreeOfParallelism = options.Value.MaxParallelism,
            CancellationToken = ct,
        };

        await Parallel.ForEachAsync(stores, parallel, async (store, token) =>
        {
            var url = store.SearchUrl(Uri.EscapeDataString(query));
            var page = await http.GetStringAsync(url, ⟨ct|token⟩);
            foreach (var offer in store.Parse(page))
                offers.Add(offer);
        });

        return [.. offers.OrderBy(o => o.UnitPrice)];
    }
}
