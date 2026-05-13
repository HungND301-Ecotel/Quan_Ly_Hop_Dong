using System.ComponentModel.DataAnnotations.Schema;
using Domain.Common.Contracts;
using Domain.Entities.Identity;

namespace Domain.Entities.Catalog;

public class SigningHistory : AuditableEntity<Guid>
{
    public Guid ContractSigningFlowId { get; protected set; }
    public Guid? SignatureId { get; protected set; }
    public string Action { get; protected set; } = string.Empty;
    public string? DeviceInfo { get; protected set; }
    public string? Location { get; protected set; }
    public bool? PinVerified { get; protected set; }

    // Navigation Properties
    [ForeignKey("ContractSigningFlowId")]
    public virtual ContractSigningFlow ContractSigningFlow { get; protected set; } = null!;

    [ForeignKey("SignatureId")]
    public virtual UserSignature? Signature { get; protected set; }

    public static SigningHistory Create(Guid contractSigningFlowId, Guid? signatureId, string action, bool? pinVerified)
    {
        return new SigningHistory
        {
            ContractSigningFlowId = contractSigningFlowId,
            Action = action,
            PinVerified = pinVerified
        };
    }

    public static SigningHistory Create(Guid contractSigningFlowId, Guid? signatureId, string action, string? deviceInfo, string? location, bool? pinVerified)
    {
        return new SigningHistory
        {
            ContractSigningFlowId = contractSigningFlowId,
            SignatureId = signatureId,
            Action = action,
            DeviceInfo = deviceInfo,
            Location = location,
            PinVerified = pinVerified
        };
    }
}

