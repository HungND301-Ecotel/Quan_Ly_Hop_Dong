using System.ComponentModel.DataAnnotations;
using Domain.Common.Contracts;
using Domain.Entities.Catalog;

namespace Domain.Entities.Category;

//Phương thức lựa họn nhà thầu
public class ProcurementMethod : AuditableEntity
{
    public string Code { get; protected set; } = string.Empty;
    public string Name { get; protected set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; protected set; }

    // Navigation Properties
    private IList<Contract> _contracts = new List<Contract>();
    public virtual IReadOnlyCollection<Contract> Contracts => _contracts.AsReadOnly();

    public void Update(string code, string name, string? description)
    {
        if (string.IsNullOrWhiteSpace(code) || string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException("ProcurementMethod code & name cannot be null or empty");
        }

        Code = code;
        Name = name;
        Description = description;
    }
}
