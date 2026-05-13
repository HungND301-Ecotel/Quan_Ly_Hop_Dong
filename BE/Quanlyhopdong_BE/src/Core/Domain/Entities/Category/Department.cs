using System.ComponentModel.DataAnnotations.Schema;
using Domain.Common.Contracts;
using Domain.Entities.Identity;

namespace Domain.Entities.Category;

public class Department : AuditableEntity<Guid>, IAggregateRoot
{
    public string Name { get; protected set; } = string.Empty;
    public string Code { get; protected set; } = string.Empty;
    public Guid? ParentId { get; protected set; }


    //Navigation properties
    [ForeignKey("ParentId")]
    public virtual Department? ParentDepartment { get; protected set; }


    private IList<Department> _subDepartments = new List<Department>();
    public virtual IReadOnlyCollection<Department> SubDepartments => _subDepartments.AsReadOnly();

    private IList<UserDepartment> _userDepartments = new List<UserDepartment>();
    public virtual IReadOnlyCollection<UserDepartment> UserDepartments => _userDepartments.AsReadOnly();

    //Constructor
    public static Department Create(string name, string code, Guid? parentid)
    {
        return new Department
        {
            Name = name,
            Code = code,
            ParentId = parentid
        };
    }
}
