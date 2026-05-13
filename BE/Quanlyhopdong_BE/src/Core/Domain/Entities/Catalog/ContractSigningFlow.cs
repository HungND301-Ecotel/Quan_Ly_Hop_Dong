using System.ComponentModel.DataAnnotations.Schema;
using Domain.Common.Contracts;
using Domain.Common.Enums;
using Domain.Entities.Identity;

namespace Domain.Entities.Catalog;

public class ContractSigningFlow : AuditableEntity<Guid>
{
    public Guid ContractId { get; protected set; }
    public Guid UserId { get; protected set; }
    public int SequenceOrder { get; protected set; }
    public SignatureType SignatureType { get; protected set; }
    public decimal? PositionX { get; protected set; }
    public decimal? PositionY { get; protected set; }
    public int? PageNumber { get; protected set; }
    public decimal? Width { get; protected set; }
    public decimal? Height { get; protected set; }
    public SigningFlowStatus Status { get; protected set; } = SigningFlowStatus.Pending;
    public DateTime? SignedAt { get; protected set; }
    public string? SignedFile { get; protected set; }
    public string? SignatureHash { get; protected set; }
    public string? RejectionReason { get; protected set; }
    public string? RevisionNotes { get; protected set; }

    // Navigation Properties
    [ForeignKey("ContractId")]
    public virtual Contract Contract { get; protected set; } = null!;

    [ForeignKey("UserId")]
    public virtual User User { get; protected set; } = null!;

    public void Update(Guid contractId, SigningFlowStatus status)
    {
        ContractId = contractId;
        Status = status;
    }

    public static ContractSigningFlow Create(Guid userId, int sequenceOrder, SignatureType signatureType, decimal? positionX, decimal? positionY, int? pageNumber, decimal? width, decimal? height)
    {
        return new ContractSigningFlow
        {
            UserId = userId,
            SequenceOrder = sequenceOrder,
            SignatureType = signatureType,
            PositionX = positionX,
            PositionY = positionY,
            PageNumber = pageNumber,
            Width = width,
            Height = height
        };
    }

    public void SetStatus(SigningFlowStatus status)
    {
        Status = status;
    }

    public void Sign()
    {
        SignedAt = DateTime.UtcNow;
        Status = SigningFlowStatus.Signed;
    }

    public void Sign(string? signedFilePath, string? signatureHash)
    {
        SignedAt = DateTime.UtcNow;
        Status = SigningFlowStatus.Signed;
        SignedFile = signedFilePath;
        SignatureHash = signatureHash;
    }

    public void SetRejectionReason(string? note)
    {
        RejectionReason = note;
    }

    public bool CheckFlowPosition()
    {
        return PositionX.HasValue && PositionY.HasValue && Width.HasValue && Height.HasValue && PageNumber.HasValue;
    }

    public void UpdatePosition(decimal positionX, decimal positionY, int pageNumber, decimal width, decimal height)
    {
        PositionX = positionX;
        PositionY = positionY;
        Width = width;
        Height = height;
    }

    public void Update(Guid userId, int sequenceOrder, SignatureType signatureType, decimal? positionX, decimal? positionY, int? pageNumber, decimal? width, decimal? height)
    {
        UserId = userId;
        SignatureType = signatureType;
        SequenceOrder = sequenceOrder;

        PositionX = positionX;
        PositionY = positionY;
        Width = width;
        Height = height;
    }

    public void Reset()
    {
        Status = SigningFlowStatus.Pending;
        SignedAt = null;
        SignedFile = null;
        SignatureHash = null;
        RejectionReason = null;
        RevisionNotes = null;
    }
}
