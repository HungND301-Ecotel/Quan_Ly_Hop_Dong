namespace Application.Dto.Catalog;

/// <summary>
/// Status count for contracts grouped by status
/// </summary>
public class ContractStatusCountDto
{
    /// <summary>
    /// Contract status name (string)
    /// </summary>
    public string StatusName { get; set; } = string.Empty;

    /// <summary>
    /// Number of contracts in this status
    /// </summary>
    public int Count { get; set; }
}

/// <summary>
/// Detailed dashboard data with contracts statistics
/// </summary>
public class ContractDashboardDto
{
    /// <summary>
    /// Total number of contracts
    /// </summary>
    public int TotalContracts { get; set; }

    /// <summary>
    /// Contract count grouped by status (only non-zero counts)
    /// </summary>
    public List<ContractStatusCountDto> ContractsByStatus { get; set; } = new List<ContractStatusCountDto>();
}
