namespace Aisles.Analytics;

public static class Stats
{
    public static T Median<T>(ReadOnlySpan<T> values) where T : INumber<T>
    {
        if (values.IsEmpty)
            throw new ArgumentException("No values", nameof(values));

        var sorted = values.ToArray();
        Array.Sort(sorted);

        var mid = sorted.Length / 2;
        return sorted.Length % 2 == 1
            ? sorted[mid]
            : (sorted[mid - 1] + sorted[mid]) / ⟨T.One|(T.One + T.One)⟩;
    }

    public static decimal PercentChange(decimal before, decimal after) =>
        before == 0 ? 0 : Math.Round((after - before) / before * 100, 1);
}
