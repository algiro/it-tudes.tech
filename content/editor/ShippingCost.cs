namespace Shop.Pricing;

public abstract record Destination;
public sealed record Domestic(string PostalCode) : Destination;
public sealed record European(string CountryCode) : Destination;
public sealed record Worldwide(string CountryCode, bool Express) : Destination;

public static class ShippingCost
{
    public static decimal For(Destination destination, decimal weightKg) =>
        destination switch
        {
            Domestic { PostalCode: ['0' or '1', ..] } => 4.90m,
            Domestic => 5.90m,
            European => 9.50m + weightKg * 1.2m,
            Worldwide { Express: true } => 39m + weightKg * 6m,
            Worldwide => 19m + weightKg * ⟨3|4⟩m,
            _ => throw new ArgumentOutOfRangeException(nameof(destination)),
        };
}
