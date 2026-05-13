using System.ComponentModel.DataAnnotations.Schema;
using Domain.Common.Contracts;

namespace Domain.Entities.Identity;

public class PositionSubmodulePermission : AuditableEntity<Guid>
{
    public Guid PositionId { get; protected set; }
    public Guid SubModuleId { get; protected set; }
    public Guid PermissionId { get; protected set; }
    public bool IsGranted { get; protected set; } = true;

    // Navigation Properties
    [ForeignKey("PositionId")]
    public virtual Position Position { get; protected set; } = null!;

    [ForeignKey("SubModuleId")]
    public virtual SubModule SubModule { get; protected set; } = null!;

    [ForeignKey("PermissionId")]
    public virtual Permission Permission { get; protected set; } = null!;

    public static PositionSubmodulePermission Create(Guid posId, Guid smId, Guid permId, bool isGraned)
    {
        return new PositionSubmodulePermission
        {
            PositionId = posId,
            SubModuleId = smId,
            PermissionId = permId,
        };
    }
}
