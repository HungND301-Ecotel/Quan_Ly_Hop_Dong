#pragma warning disable CS8618 // Non-nullable field must contain a non-null value when exiting constructor. Consider declaring as nullable.

namespace Application.Common.Responses;

/// <summary>
/// This class is used to create standard responses for AJAX/remote requests.
/// </summary>
[Serializable]
public class ResponseBase : ResponseBase<object>
{
    /// <summary>
    /// Creates an <see cref="ResponseBase"/> object.
    /// <see cref="ResponseOfBase.Success"/> is set as true.
    /// </summary>
    public ResponseBase()
    {
    }

    /// <summary>
    /// Creates an <see cref="ResponseBase"/> object with <see cref="ResponseOfBase.Success"/> specified.
    /// </summary>
    /// <param name="success">Indicates success status of the result. </param>
    public ResponseBase(bool success)
        : base(success)
    {
    }

    /// <summary>
    /// Creates an <see cref="ResponseBase"/> object with <see cref="ResponseBase{TResult}.Result"/> specified.
    /// <see cref="ResponseOfBase.Success"/> is set as true.
    /// </summary>
    /// <param name="result">The actual result object. </param>
    public ResponseBase(object result)
        : base(result)
    {
    }
}