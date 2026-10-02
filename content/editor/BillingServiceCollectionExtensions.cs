namespace Billing;

public static class BillingServiceCollectionExtensions
{
    public static IServiceCollection AddBilling(
        this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContextPool<BillingDb>(options =>
            options.UseNpgsql(configuration.GetConnectionString("Billing")));

        services.⟨AddSingleton|AddScoped⟩<IInvoiceRepository, InvoiceRepository>();
        services.AddSingleton(TimeProvider.System);

        services.AddHttpClient<IExchangeRates, EcbExchangeRates>(client =>
        {
            client.BaseAddress = new Uri("https://data-api.ecb.europa.eu/");
            client.Timeout = TimeSpan.FromSeconds(10);
        });

        return services;
    }
}
