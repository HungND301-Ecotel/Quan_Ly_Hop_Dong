using Domain.Common.Contracts;
using Domain.Entities.Catalog;

namespace Domain.Entities.Category;

public class ContractType : AuditableEntity<Guid>
{
    public string Name { get; protected set; } = string.Empty;
    public string Code { get; protected set; } = string.Empty;
    public string? Description { get; protected set; }

    // Navigation Properties - 1-1 with Level1Code
    public virtual Level1Code? Level1Code { get; protected set; }

    //Constructor
    public static ContractType Create(string name, string code, string? description)
    {
        return new ContractType
        {
            Name = name,
            Code = code,
            Description = description
        };
    }

    public void Update(string name, string code, string? description)
    {
        Name = name;
        Code = code;
        Description = description;
    }
}
