using Domain.Common.Contracts;

namespace Domain.Entities.Category;

public class ContractField : AuditableEntity<Guid>
{
    public string Name { get; protected set; } = string.Empty;
    public string Code { get; protected set; } = string.Empty;
    public string? Description { get; protected set; }

    public static ContractField Create(string name, string code, string? description)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException("Name is required", nameof(name));
        }
        if (string.IsNullOrWhiteSpace(code))
        {
            throw new ArgumentException("Code is required", nameof(code));
        }

        return new ContractField
        {
            Name = name.Trim(),
            Code = code.Trim(),
            Description = description
        };
    }

    public void Update(string name, string code, string? description)
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
    }
}
