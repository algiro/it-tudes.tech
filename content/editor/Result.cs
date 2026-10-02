namespace Common;

public readonly record struct Error(string Code, string Message);

public sealed class Result<T>
{
    private readonly T? _value;

    private Result(T value) => (_value, IsSuccess) = (value, true);
    private Result(Error error) => (Error, IsSuccess) = (error, false);

    public bool IsSuccess { get; }
    public ⟨Error?|Error⟩ Error { get; }

    public T Value => IsSuccess
        ? _value!
        : throw new InvalidOperationException(Error.Message);

    public static Result<T> Ok(T value) => new(value);

    public static Result<T> Fail(string code, string message) =>
        new(new Error(code, message));

    public TOut Match<TOut>(Func<T, TOut> ok, Func<Error, TOut> fail) =>
        IsSuccess ? ok(_value!) : fail(Error);
}
