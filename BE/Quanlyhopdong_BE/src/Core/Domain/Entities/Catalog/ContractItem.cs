using System.ComponentModel.DataAnnotations.Schema;
using Domain.Common.Contracts;
using Domain.Entities.Category;

namespace Domain.Entities.Catalog;

public class ContractItem : AuditableEntity
{
    public Guid ContractId { get; protected set; }
    public Guid MaterialId { get; protected set; }
    public decimal Quantity { get; protected set; }
    public decimal Price { get; protected set; }
    public decimal Amount { get; protected set; }

    // Navigation properties
    [ForeignKey(nameof(ContractId))]
    public virtual Contract Contract { get; set; }
    [ForeignKey(nameof(MaterialId))]
    public virtual Material Material { get; set; }

    //Constructor
    public static ContractItem Create(Guid contractId, Guid materialId, decimal quantity, decimal price)
    {
        return new ContractItem
        {
            ContractId = contractId,
            MaterialId = materialId,
            Quantity = quantity,
            Price = price,
            Amount = quantity * price
        };
    }

    public static ContractItem Create(Guid materialId, decimal quantity, decimal price)
    {
        return new ContractItem
        {
            MaterialId = materialId,
            Quantity = quantity,
            Price = price,
            Amount = quantity * price
        };
    }
}
