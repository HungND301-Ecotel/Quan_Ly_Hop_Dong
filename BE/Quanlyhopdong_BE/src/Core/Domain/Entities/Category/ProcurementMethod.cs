using Domain.Common.Contracts;
using Domain.Entities.Catalog;

namespace Domain.Entities.Category;

//Phương thức lựa họn nhà thầu
public class ProcurementMethod : AuditableEntity
{
    public string Code { get; protected set; } = string.Empty;
    public string Name { get; protected set; } = string.Empty;

    // Navigation Properties
    private IList<Contract> _contracts = new List<Contract>();
    public virtual IReadOnlyCollection<Contract> Contracts => _contracts.AsReadOnly();

    public void Update(string code, string name)
    {
        if (string.IsNullOrWhiteSpace(code) || string.IsNullOrWhiteSpace(name))
        {
            throw new AggregateException("ProcurementMethod code & name cannot be null or empty");
        }

        Code = code;
        Name = name;
    }
}
