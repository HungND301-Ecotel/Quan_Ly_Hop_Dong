using System.ComponentModel.DataAnnotations.Schema;
using Domain.Common.Contracts;
using Domain.Common.Enums;
using Domain.Entities.Identity;

namespace Domain.Entities.Catalog;

public class ContractUserRole : AuditableEntity
{
    public Guid ContractId { get; protected set; }
    public Guid UserId { get; protected set; }

    public ContractRole Role { get; protected set; }

    // Navigation Properties
    [ForeignKey(nameof(ContractId))]
    public virtual Contract Contract { get; protected set; } = null!;
    [ForeignKey(nameof(UserId))]
    public virtual User User { get; protected set; } = null!;

    //Constructor
    public static ContractUserRole Create(Guid userId, ContractRole role)
    {
        return new ContractUserRole
        {
            UserId = userId,
            Role = role
        };
    }

    public void Update(Guid userId, ContractRole role)
    {
        UserId = userId;
        Role = role;
    }
}
