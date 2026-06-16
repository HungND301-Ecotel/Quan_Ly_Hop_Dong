namespace Application.Dto.Catalog;

public class Level1CodeDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid ContractTypeId { get; set; }
    public string ContractTypeName { get; set; } = string.Empty;
    public Guid? ContractRegisterId { get; set; }
    public string? ContractRegisterName { get; set; }
}

public class CreateLevel1CodeRequest
{
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid ContractTypeId { get; set; }
    public Guid? ContractRegisterId { get; set; }
}

public class UpdateLevel1CodeRequest
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid ContractTypeId { get; set; }
    public Guid? ContractRegisterId { get; set; }
}
