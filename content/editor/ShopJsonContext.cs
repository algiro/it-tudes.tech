namespace Shop.Api;

[JsonSourceGenerationOptions(
    PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase,
    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull)]
[JsonSerializable(typeof(OrderDto))]
[JsonSerializable(typeof(⟨OrderDto[]|List<OrderDto>⟩))]
[JsonSerializable(typeof(ProblemDetails))]
internal partial class ShopJsonContext : JsonSerializerContext;

public static class JsonSetup
{
    public static IServiceCollection AddShopJson(this IServiceCollection services) =>
        services.ConfigureHttpJsonOptions(options =>
            options.SerializerOptions.TypeInfoResolverChain.Insert(
                0, ShopJsonContext.Default));
}
