namespace Application.Dto.Catalog;

public class ContractNumberDto
{
    public Guid Id { get; set; }
    public string Number { get; set; } = string.Empty;
    public string? SignNumber { get; set; }
    public string? Description { get; set; }
}

public class CreateContractNumberDto
{
    public string Number { get; set; } = string.Empty;
    public string? SignNumber { get; set; }
    public string? Description { get; set; }
}
