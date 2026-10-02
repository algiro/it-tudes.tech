namespace Billing.Export;

public static class CsvExport
{
    public static async Task WriteAsync(
        Stream output,
        IAsyncEnumerable<InvoiceRow> rows,
        CancellationToken ct)
    {
        await using var writer = new StreamWriter(output, leaveOpen: true);
        await writer.WriteLineAsync("number;date;customer;net;gross");

        await foreach (var row in rows.WithCancellation(ct))
        {
            var line = string.Join(';',
                row.Number,
                row.Date.ToString("yyyy-MM-dd"⟨|, CultureInfo.InvariantCulture|later⟩),
                Escape(row.Customer),
                row.Net.ToString(CultureInfo.InvariantCulture),
                row.Gross.ToString(CultureInfo.InvariantCulture));

            await writer.WriteLineAsync(line);
        }
    }

    private static string Escape(string value) =>
        value.Contains(';') || value.Contains('"')
            ? $"\"{value.Replace("\"", "\"\"")}\""
            : value;
}
