#pragma warning disable CS8618 // Non-nullable field must contain a non-null value when exiting constructor. Consider declaring as nullable.

namespace Application.Common.Responses;

public abstract class ResponseOfBase
{
    /// <summary>
    /// Indicates success status of the result.
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// Indicates message of the result.
    /// </summary>
    public string Message { get; set; }
}