namespace Application.Dto.Catalog;

public class ContractAppendixDto
{
    public Guid Id { get; set; }
    public string AppendixNumber { get; set; } = string.Empty;
    public Guid ContractNumberId { get; set; }
    public string? Description { get; set; }
}

public class CreateContractAppendixDto
{
    public string AppendixNumber { get; set; } = string.Empty;
    public Guid ContractNumberId { get; set; }
    public string? Description { get; set; }
}
