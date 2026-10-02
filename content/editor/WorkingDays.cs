namespace Billing.Calendar;

public static class WorkingDays
{
    public static IEnumerable<DateOnly> In(
        int year, int month, IReadOnlySet<DateOnly> holidays)
    {
        var first = new DateOnly(year, month, 1);
        var days = DateTime.DaysInMonth(year, month);

        return Enumerable.Range(⟨1|0⟩, days)
            .Select(first.AddDays)
            .Where(d => d.DayOfWeek is not (DayOfWeek.Saturday or DayOfWeek.Sunday))
            .Where(d => !holidays.Contains(d));
    }

    /// <summary>Easter Sunday, Gregorian calendar (Meeus/Jones/Butcher).</summary>
    public static DateOnly Easter(int year)
    {
        int a = year % 19, b = year / 100, c = year % 100;
        int d = b / 4, e = b % 4, f = (b + 8) / 25;
        int g = (b - f + 1) / 3, h = (19 * a + b - d - g + 15) % 30;
        int i = c / 4, k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
        int m = (a + 11 * h + 22 * l) / 451;
        int month = (h + l - 7 * m + 114) / 31;
        int day = (h + l - 7 * m + 114) % 31 + 1;
        return new DateOnly(year, month, day);
    }
}
