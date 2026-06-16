namespace Application.Dto.Catalog;

public class ContractRegisterDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int? Year { get; set; }
    public string? Description { get; set; }
}

public class CreateContractRegisterDto
{
    public string Name { get; set; } = string.Empty;
    public int? Year { get; set; }
    public string? Description { get; set; }
}
