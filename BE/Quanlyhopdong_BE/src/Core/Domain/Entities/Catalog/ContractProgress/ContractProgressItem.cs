using System.ComponentModel.DataAnnotations.Schema;
using Domain.Common.Contracts;

namespace Domain.Entities.Catalog.ContractProgress;

/// <summary>
/// Chi ti?t ti?n ð? th?c hi?n theo t?ng v?t tý/h?ng m?c
/// </summary>
public class ContractProgressItem : AuditableEntity
{
    public Guid ContractProgressId { get; protected set; }
    public Guid ContractItemId { get; protected set; }
    public decimal ExecutedQuantity { get; protected set; }
    public decimal ExecutedAmount { get; protected set; }

    public string? Notes { get; protected set; }

    // Navigation Properties
    [ForeignKey(nameof(ContractProgressId))]
    public virtual ContractProgress ContractProgress { get; protected set; } = null!;

    [ForeignKey(nameof(ContractItemId))]
    public virtual ContractItem ContractItem { get; protected set; } = null!;

    // Constructors
    protected ContractProgressItem() { }

    public static ContractProgressItem Create(
        Guid contractProgressId,
        Guid contractItemId,
        decimal executedQuantity,
        decimal unitPrice,
        string? notes = null)
    {
        if (executedQuantity < 0)
        {
            throw new ArgumentException("Executed quantity cannot be negative");
        }

        return new ContractProgressItem
        {
            ContractProgressId = contractProgressId,
            ContractItemId = contractItemId,
            ExecutedQuantity = executedQuantity,
            ExecutedAmount = executedQuantity * unitPrice,
            Notes = notes
        };
    }

    public static ContractProgressItem Create(
        Guid contractItemId,
        decimal executedQuantity,
        decimal unitPrice,
        string? notes = null)
    {
        if (executedQuantity < 0)
        {
            throw new ArgumentException("Executed quantity cannot be negative");
        }

        return new ContractProgressItem
        {
            ContractItemId = contractItemId,
            ExecutedQuantity = executedQuantity,
            ExecutedAmount = executedQuantity * unitPrice,
            Notes = notes
        };
    }

    public void Update(
        decimal executedQuantity,
        decimal unitPrice,
        string? notes = null)
    {
        if (executedQuantity < 0)
        {
            throw new ArgumentException("Executed quantity cannot be negative");
        }

        ExecutedQuantity = executedQuantity;
        ExecutedAmount = executedQuantity * unitPrice;
        Notes = notes;
    }

    /// <summary>
    /// Tính kh?i lý?ng c?n l?i so v?i h?p ð?ng
    /// </summary>
    public decimal GetRemainingQuantity()
    {
        return ContractItem.Quantity - ExecutedQuantity;
    }

    /// <summary>
    /// Tính giá tr? c?n l?i so v?i h?p ð?ng
    /// </summary>
    public decimal GetRemainingAmount()
    {
        return ContractItem.Amount - ExecutedAmount;
    }

    /// <summary>
    /// Tính % hoàn thành
    /// </summary>
    public decimal GetCompletionPercentage()
    {
        if (ContractItem.Quantity == 0)
        {
            return 0;
        }

        return (ExecutedQuantity / ContractItem.Quantity) * 100;
    }
}
