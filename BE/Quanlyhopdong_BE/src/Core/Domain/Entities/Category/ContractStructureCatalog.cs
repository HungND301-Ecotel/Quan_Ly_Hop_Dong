using System.ComponentModel.DataAnnotations;
using Domain.Common.Contracts;
using Domain.Entities.Catalog;

namespace Domain.Entities.Category;

public class ContractStructureCatalog : AuditableEntity<Guid>
{
    public string Name { get; protected set; } = string.Empty;
    public string Code { get; protected set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; protected set; }
    public bool IsActive { get; protected set; } = true;

    private readonly IList<Contract> _contracts = new List<Contract>();
    public virtual IReadOnlyCollection<Contract> Contracts => _contracts.AsReadOnly();

    public static ContractStructureCatalog Create(string name, string code, string? description, bool isActive = true)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException("Name is required", nameof(name));
        }
        if (string.IsNullOrWhiteSpace(code))
        {
            throw new ArgumentException("Code is required", nameof(code));
        }

        return new ContractStructureCatalog
        {
            Name = name.Trim(),
            Code = code.Trim(),
            Description = description,
            IsActive = isActive
        };
    }

    public void Update(string name, string code, string? description, bool isActive)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException("Name is required", nameof(name));
        }
        if (string.IsNullOrWhiteSpace(code))
        {
            throw new ArgumentException("Code is required", nameof(code));
        }

        Name = name.Trim();
        Code = code.Trim();
        Description = description;
        IsActive = isActive;
    }
}
