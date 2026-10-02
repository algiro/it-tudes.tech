namespace Trading.Fix;

/// <summary>Reads tag=value fields from a raw FIX message.</summary>
public ref struct FixReader
{
    private const byte Soh = 0x01;
    private ReadOnlySpan<byte> _remaining;

    public FixReader(ReadOnlySpan<byte> message) => _remaining = message;

    public bool TryRead(out int tag, out ReadOnlySpan<byte> value)
    {
        tag = 0;
        value = default;
        if (_remaining.IsEmpty) return false;

        var end = _remaining.IndexOf(Soh);
        var field = end < 0 ? _remaining : _remaining[..end];
        _remaining = end < 0 ? default : _remaining[(end + 1)..];

        var eq = field.IndexOf((byte)'=');
        if (eq ⟨< 0|<= 0⟩) return false;

        foreach (var b in field[..eq])
            tag = tag * 10 + (b - '0');

        value = field[(eq + 1)..];
        return true;
    }
}
