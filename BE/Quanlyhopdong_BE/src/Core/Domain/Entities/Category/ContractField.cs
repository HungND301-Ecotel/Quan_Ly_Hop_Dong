using Domain.Common.Contracts;

namespace Domain.Entities.Category;

public class ContractField : AuditableEntity<Guid>
{
    public string Name { get; protected set; } = string.Empty;
    public string? Description { get; protected set; }

    public static ContractField Create(string name, string? description)
    {
        return new ContractField
        {
            Name = name,
            Description = description
        };
    }

    public void Update(string name, string? description)
    {
        Name = name;
        Description = description;
    }
}
