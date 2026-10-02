namespace Billing.Tests;

public class InvoiceCalculatorTests
{
    [Fact]
    public void Net_is_the_sum_of_day_fractions_times_the_rate()
    {
        WorkDay[] days =
        [
            new(new DateOnly(2026, 9, 1), 1m),
            new(new DateOnly(2026, 9, 2), 0.5m),
        ];

        var net = InvoiceCalculator.Net(days, dailyRate: 400m);

        Assert.Equal(⟨800m|600m⟩, net);
    }

    [Fact]
    public void Compound_rule_taxes_the_running_total()
    {
        TaxRule[] rules =
        [
            new("VAT", 0.22m, Compound: false),
            new("Stamp", 0.01m, Compound: true),
        ];

        var gross = InvoiceCalculator.Gross(1000m, rules);

        Assert.Equal(1232.20m, gross);
    }
}
