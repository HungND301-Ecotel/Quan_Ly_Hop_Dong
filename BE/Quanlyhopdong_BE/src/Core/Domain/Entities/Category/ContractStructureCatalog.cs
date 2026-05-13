using Domain.Common.Contracts;
using Domain.Entities.Catalog;

namespace Domain.Entities.Category;

public class ContractStructureCatalog : AuditableEntity<Guid>
{
    public string Name { get; protected set; } = string.Empty;
    public bool IsActive { get; protected set; } = true;

    private readonly IList<Contract> _contracts = new List<Contract>();
    public virtual IReadOnlyCollection<Contract> Contracts => _contracts.AsReadOnly();

    public static ContractStructureCatalog Create(string name, bool isActive = true)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException("Name is required", nameof(name));
        }

        return new ContractStructureCatalog
        {
            Name = name.Trim(),
            IsActive = isActive
        };
    }

    public void Update(string name, bool isActive)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException("Name is required", nameof(name));
        }

        Name = name.Trim();
        IsActive = isActive;
    }
}
