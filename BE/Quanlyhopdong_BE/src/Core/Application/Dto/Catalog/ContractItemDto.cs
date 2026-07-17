namespace Application.Dto.Catalog;

public class ContractItemDto
{
    public Guid Id { get; set; }
    public bool IsOtherMaterial { get; set; } = false;
    public Guid ContractId { get; set; }
    public Guid MaterialId { get; set; }
    public string MaterialCode { get; set; }
    public string MaterialName { get; set; }
    public decimal Price { get; set; }
    public decimal Quantity { get; set; }
    public decimal Amount { get; set; }
    public string? UnitOfMeasureName { get; set; }
    public string? UnitOfMeasureCode { get; set; }
}

public class UpdateContractItemDto
{
    public Guid Id { get; set; }
    public Guid MaterialId { get; set; }
    public decimal Quantity { get; set; }
    public decimal Price { get; set; }
}

public class CreateContractItemDto
{
    public Guid MaterialId { get; set; }
    public decimal Quantity { get; set; }
    public decimal Price { get; set; }
}
