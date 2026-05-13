namespace Application.Common.Models;

// TODO: Split into 3 seperated interfaces
public interface IAdvancedFilter<TSearch, TFilter> : ISpecPayload
    where TSearch : ISearch
    where TFilter : IFilter<TFilter>
{
    /// <summary>
    /// Column Wise Search is Supported.
    /// </summary>
    public TSearch? AdvancedSearch { get; set; }

    /// <summary>
    /// Advanced column filtering with logical operators and query operators is supported.
    /// </summary>
    public TFilter? AdvancedFilter { get; set; }
}

public interface IAdvancedFilter : IAdvancedFilter<Search, Filter>;