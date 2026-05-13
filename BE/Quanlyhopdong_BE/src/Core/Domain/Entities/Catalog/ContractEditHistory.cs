using System.ComponentModel.DataAnnotations.Schema;
using Domain.Common.Contracts;
using Domain.Entities.Identity;

namespace Domain.Entities.Catalog;

public class ContractEditHistory : AuditableEntity<Guid>
{
    public Guid ContractId { get; protected set; }
    public Guid EditedBy { get; protected set; }
    public string FieldName { get; protected set; } = string.Empty;
    public string? OldValue { get; protected set; }
    public string? NewValue { get; protected set; }
    public string? EditReason { get; protected set; }

    // Navigation Properties
    [ForeignKey("ContractId")]
    public virtual Contract Contract { get; protected set; } = null!;

    [ForeignKey("EditedBy")]
    public virtual User Editor { get; protected set; } = null!;

    public static ContractEditHistory Create(Guid contractId, Guid editBy, string fieldName, string? oldValue, string? newValue, string? editReason)
    {
        return new ContractEditHistory
        {
            ContractId = contractId,
            EditedBy = editBy,
            FieldName = fieldName,
            OldValue = oldValue,
            NewValue = newValue,
            EditReason = editReason
        };
    }
}
