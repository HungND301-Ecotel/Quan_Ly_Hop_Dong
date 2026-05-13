using Domain.Common.Enums;

namespace Application.Dto.Catalog;

public class ApproveContractDto
{
    public Guid ContractId { get; set; }
    public ContractAction Action { get; set; } // "Approve", "Reject", "RequestRevision"
    public string? Comment { get; set; }
    public string? RejectionReason { get; set; }
    public string? RevisionNotes { get; set; }
    public Guid? SignatureId { get; set; }
    public ContractSigningFlowPositionDto? SigningFlowPositions { get; set; }

    // For Digital CA signature
    public string? CertificateUuid { get; set; }
    public string? Pin { get; set; }
}

public class ContractApprovalHistoryDto
{
    public Guid Id { get; set; }
    public Guid ContractId { get; set; }
    public Guid UserId { get; set; }
    public string UserName { get; set; }
    public string FullName { get; set; }
    public UserRole? Role { get; set; }
    public Guid PositionId { get; set; }
    public string PositionName { get; set; }
    public ContractAction? Action { get; set; }
    public string? FromStatus { get; set; }
    public string? ToStatus { get; set; }
    public string? FromSubStatus { get; set; }
    public string? ToSubStatus { get; set; }
    public SignatureType? SignatureType { get; set; }
    public string? Comment { get; set; }
    public DateTimeOffset CreatedOn { get; set; }
}