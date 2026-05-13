using System.ComponentModel.DataAnnotations.Schema;
using Domain.Common.Contracts;
using Domain.Common.Enums;

namespace Domain.Entities.Identity;

public class UserSignature : AuditableEntity<Guid>
{
    public Guid UserId { get; protected set; }
    public SignatureType SignatureType { get; protected set; }

    public string? SignatureFile { get; protected set; }
    public string? CertificateId { get; protected set; }
    public string? CertificateFile { get; protected set; }
    public string? PinHash { get; protected set; }
    public bool IsPinSaved { get; protected set; } = false;
    public bool IsActive { get; protected set; } = true;

    //Navigation Properties
    [ForeignKey("UserId")]
    public virtual User User { get; protected set; } = null!;

    public static UserSignature Create(Guid userId, SignatureType signatureType, string? signatureFile)
    {
        return new UserSignature
        {
            UserId = userId,
            SignatureType = signatureType,
            SignatureFile = signatureFile
        };
    }
    public static UserSignature Create(Guid userId, SignatureType signatureType, string? signatureFile, string? certificateId, string? pinHash, bool isPinSaved)
    {
        return new UserSignature
        {
            UserId = userId,
            SignatureType = signatureType,
            SignatureFile = signatureFile,
            CertificateId = certificateId,
            PinHash = pinHash,
            IsPinSaved = isPinSaved,
        };
    }

    public void SetActive(bool value)
    {
        IsActive = value;
    }
}
