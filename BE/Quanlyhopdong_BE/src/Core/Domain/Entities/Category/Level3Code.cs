using System.ComponentModel.DataAnnotations.Schema;
using Domain.Common.Contracts;
using Domain.Entities.Catalog;

namespace Domain.Entities.Category;

public class Level3Code : AuditableEntity<Guid>
{
    public string Code { get; protected set; } = string.Empty;
    public string? Description { get; protected set; }
    public Guid Level1CodeId { get; protected set; }

    // Navigation Properties
    [ForeignKey("Level1CodeId")]
    public virtual Level1Code Level1Code { get; protected set; } = null!;

    private IList<Contract> _contracts = new List<Contract>();
    public virtual IReadOnlyCollection<Contract> Contracts => _contracts.AsReadOnly();

    public virtual SignedContent? SignedContent { get; protected set; }

    // Constructor
    public static Level3Code Create(string code, Guid level1CodeId, string? description = null)
    {
        return new Level3Code
        {
            Code = code,
            Level1CodeId = level1CodeId,
            Description = description
        };
    }

    public void Update(string code, Guid level1CodeId, string? description = null)
    {
        Code = code;
        Level1CodeId = level1CodeId;
        Description = description;
    }
}
