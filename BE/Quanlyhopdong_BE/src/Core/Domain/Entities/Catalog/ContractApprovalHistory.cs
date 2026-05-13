using System.ComponentModel.DataAnnotations.Schema;
using Domain.Common.Contracts;
using Domain.Common.Enums;
using Domain.Entities.Identity;

namespace Domain.Entities.Catalog;

public class ContractApprovalHistory : AuditableEntity<Guid>
{
    public Guid ContractId { get; protected set; }
    public Guid UserId { get; protected set; }
    public ContractAction? Action { get; protected set; }
    public string? FromStatus { get; protected set; }
    public string? ToStatus { get; protected set; }
    public string? FromSubStatus { get; protected set; }
    public string? ToSubStatus { get; protected set; }
    public SignatureType? SignatureType { get; protected set; }
    public string? Comment { get; protected set; }

    // Navigation Properties
    [ForeignKey("ContractId")]
    public virtual Contract Contract { get; protected set; } = null!;

    [ForeignKey("UserId")]
    public virtual User User { get; protected set; } = null!;

    public static ContractApprovalHistory Create(Guid contractId, Guid userId, ContractAction? action, string toStatus)
    {
        return new ContractApprovalHistory
        {
            ContractId = contractId,
            UserId = userId,
            Action = action,
            ToStatus = toStatus
        };
    }

    public static ContractApprovalHistory Create(Guid contractId, Guid userId, ContractAction? action, string? fromStatus, string? toStatus, string? fromSubStatus, string? toSubStatus, SignatureType? signatureType, string? comment)
    {
        return new ContractApprovalHistory
        {
            ContractId = contractId,
            UserId = userId,
            Action = action,
            FromStatus = fromStatus,
            ToStatus = toStatus,
            FromSubStatus = fromSubStatus,
            ToSubStatus = toSubStatus,
            SignatureType = signatureType,
            Comment = comment
        };
    }
}
