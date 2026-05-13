namespace Application.Dto.Common;

public class SortByCommonModel
{
    public string OrderBy { get; set; } = string.Empty;

    public bool IsAscending { get; set; } = true;
}

public class PreHandleSortingInSpecModel
{
    public string[]? OrderBy { get; set; } = [];

    public IList<SortByCommonModel> CustomOrders { get; set; } = new List<SortByCommonModel>();

    public bool UseCustomOrderOnly { get; set; }

    public PreHandleSortingInSpecModel()
    {
    }

    public PreHandleSortingInSpecModel(string[]? orderBy, IList<SortByCommonModel> customOrders, bool useCustomOrderOnly)
    {
        OrderBy = orderBy;
        CustomOrders = customOrders;
        UseCustomOrderOnly = useCustomOrderOnly;
    }
}