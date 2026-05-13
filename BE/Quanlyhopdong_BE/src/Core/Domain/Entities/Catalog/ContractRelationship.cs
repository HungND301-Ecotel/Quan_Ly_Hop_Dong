using Domain.Common.Contracts;
using Domain.Common.Enums;

namespace Domain.Entities.Catalog;

/// <summary>
/// Bảng trung gian quản lý quan hệ cha-con giữa các hợp đồng (Template -> Economic, Contract -> Extension)
/// </summary>
public class ContractRelationship : AuditableEntity<Guid>
{
    /// <summary>
    /// Hợp đồng cha (Template hoặc hợp đồng gốc để gia hạn)
    /// </summary>
    public Guid ParentContractId { get; protected set; }

    /// <summary>
    /// Hợp đồng con (Economic hoặc hợp đồng gia hạn)
    /// </summary>
    public Guid ChildContractId { get; protected set; }

    /// <summary>
    /// Loại quan hệ: LinkedContract (từ template) hoặc RenewalContract (gia hạn)
    /// </summary>
    public ParentContractRelationType RelationType { get; protected set; }

    /// <summary>
    /// Ghi chú về quan hệ
    /// </summary>
    public string? Notes { get; protected set; }

    /// <summary>
    /// Ngày tạo quan hệ
    /// </summary>
    public DateTimeOffset CreatedDate { get; protected set; }

    // Navigation Properties
    public virtual Contract ParentContract { get; protected set; } = null!;
    public virtual Contract ChildContract { get; protected set; } = null!;

    /// <summary>
    /// Tạo quan hệ cha-con giữa hai hợp đồng
    /// </summary>
    public static ContractRelationship Create(
    Guid parentContractId,
    ContractFormat parentContractFormat,
    Guid childContractId,
    ContractFormat childContractFormat,
    ParentContractRelationType relationType,
    string? notes = null)
    {
        if (parentContractId == childContractId)
        {
            throw new ArgumentException("ParentContractId cannot be the same as ChildContractId");
        }
        // LinkedContract: cha phải là Economic
        if (relationType == ParentContractRelationType.LinkedContract &&
            parentContractFormat != ContractFormat.EconomicBuy &&
            parentContractFormat != ContractFormat.EconomicSell)
        {
            throw new ArgumentException("LinkedContract requires parent to be a Template");
        }
        return new ContractRelationship
        {
            Id = Guid.NewGuid(),
            ParentContractId = parentContractId,
            ChildContractId = childContractId,
            RelationType = relationType,
            Notes = notes,
            CreatedDate = DateTimeOffset.UtcNow
        };
    }

    /// <summary>
    /// Cập nhật ghi chú
    /// </summary>
    public void UpdateNotes(string? notes)
    {
        Notes = notes;
    }
}
