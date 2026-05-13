using System.ComponentModel.DataAnnotations.Schema;
using Domain.Common.Contracts;
using Domain.Entities.Category;

namespace Domain.Entities.Identity;

public class UserDepartment : AuditableEntity<Guid>
{
    public Guid UserId { get; protected set; }
    public Guid DepartmentId { get; protected set; }
    public bool IsPrimary { get; protected set; } = false;


    // Navigation Properties
    [ForeignKey("UserId")]
    public virtual User User { get; protected set; } = null!;

    [ForeignKey("DepartmentId")]
    public virtual Department Department { get; protected set; } = null!;
    public static UserDepartment Create(Guid userId, Guid departmentId, bool IsPrimary)
    {
        return new UserDepartment
        {
            UserId = userId,
            DepartmentId = departmentId,
            IsPrimary = IsPrimary
        };
    }

    public static UserDepartment Create(Guid departmentId, bool IsPrimary)
    {
        return new UserDepartment
        {
            DepartmentId = departmentId,
            IsPrimary = IsPrimary
        };
    }
}
