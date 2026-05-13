namespace Application.Common.Pagination;

public class PagedResultDto<T>
{
    public int TotalCount { get; set; }
    public IReadOnlyList<T> Items { get; set; }

    public PagedResultDto()
    {
        TotalCount = 0;
        this.Items = new List<T>();
    }

    /// <summary>
    /// </summary>
    /// <param name="totalCount">Total count of Items</param>
    /// <param name="items">List of items in current page</param>
    public PagedResultDto(int totalCount, IReadOnlyList<T> items)
    {
        this.TotalCount = totalCount;
        this.Items = items;
    }
}

public class PagedResultDtoLastOrder<T> : PagedResultDto<T>
{
    public int? LastOrderIndexFullTest { get; set; }
    public int? LastOrderIndexReading { get; set; }
}