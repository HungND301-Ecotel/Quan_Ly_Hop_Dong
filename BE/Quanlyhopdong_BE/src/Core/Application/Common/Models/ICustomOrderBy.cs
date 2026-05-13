using System.Linq.Expressions;

namespace Application.Common.Models;

public interface ICustomOrderBy<T> : IOrderBy
{
    /// <summary>
    /// A <see cref="Dictionary{TKey,TValue}"/> to define custom orderBy.
    /// </summary>
    /// <remarks>Remember to add attribute [JsonIgnore] to implementation.</remarks>
    public Dictionary<string, Expression<Func<T, object?>>> CustomOrderBy { get; }
}