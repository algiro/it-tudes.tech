namespace Aisles.Scraping;

public sealed class ScraperOptions
{
    public const string Section = "Scraper";

    [Required, Url]
    public string BaseUrl { get; init; } = "";

    [Range(1, 32)]
    public int MaxParallelism { get; init; } = 4;

    public TimeSpan RequestTimeout { get; init; } = TimeSpan.FromSeconds(⟨10|30⟩);
}

public static class ScraperSetup
{
    public static IServiceCollection AddScraper(this IServiceCollection services)
    {
        services.AddOptions<ScraperOptions>()
            .BindConfiguration(ScraperOptions.Section)
            .ValidateDataAnnotations()
            .ValidateOnStart();

        return services;
    }
}
