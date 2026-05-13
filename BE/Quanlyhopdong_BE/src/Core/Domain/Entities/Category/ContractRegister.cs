using Domain.Common.Contracts;
using Domain.Entities.Catalog;

namespace Domain.Entities.Category;

//Sổ đăng ký / sổ theo dõi hợp đồng
public class ContractRegister : AuditableEntity
{
    public string Name { get; protected set; } = string.Empty;

    // Navigation Properties
    private IList<Contract> _contracts = new List<Contract>();
    public virtual IReadOnlyCollection<Contract> Contracts => _contracts.AsReadOnly();

    public void Update(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new AggregateException("Contract register name cannot be null or empty");
        }

        Name = name;
    }
}
