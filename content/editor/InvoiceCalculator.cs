namespace Billing;

public sealed record WorkDay(DateOnly Date, decimal Fraction);

public sealed record TaxRule(string Name, decimal Rate, bool Compound);

public static class InvoiceCalculator
{
    public static decimal Net(IEnumerable<WorkDay> days, decimal dailyRate) =>
        days.Sum(d => d.Fraction) * dailyRate;

    /// <summary>Applies the rules in order; compound rules tax the running total.</summary>
    public static decimal Gross(decimal net, IReadOnlyList<TaxRule> rules)
    {
        var total = net;
        foreach (var rule in rules)
        {
            var basis = rule.Compound ? total : net;
            total += ⟨basis * rule.Rate|Math.Round(basis * rule.Rate, 2)|later⟩;
        }
        return total;
    }
}
