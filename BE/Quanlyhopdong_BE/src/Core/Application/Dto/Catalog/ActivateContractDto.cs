using Domain.Common.Enums;

namespace Application.Dto.Catalog;

public class ActivateContractDto
{
    public Guid ContractId { get; set; }
    public ContractStatus Status { get; set; }
    public ContractSubStatus SubStatus { get; set; }
    public string ContractFilePath { get; set; } = string.Empty;
}
