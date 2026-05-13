namespace Application.Dto.Catalog;

public class ContractRegisterDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

public class CreateContractRegisterDto
{
    public string Name { get; set; } = string.Empty;
}
