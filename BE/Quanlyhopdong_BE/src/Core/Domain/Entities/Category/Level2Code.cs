using System.ComponentModel.DataAnnotations.Schema;
using Domain.Common.Contracts;
using Domain.Entities.Catalog;

namespace Domain.Entities.Category;

public class Level2Code : AuditableEntity<Guid>
{
    public string Code { get; protected set; } = string.Empty;
    public string? Description { get; protected set; }
    public Guid Level1CodeId { get; protected set; }

    // Navigation Properties
    [ForeignKey("Level1CodeId")]
    public virtual Level1Code Level1Code { get; protected set; } = null!;

    private IList<Contract> _contracts = new List<Contract>();
    public virtual IReadOnlyCollection<Contract> Contracts => _contracts.AsReadOnly();

    // Constructor
    public static Level2Code Create(string code, Guid level1CodeId, string? description = null)
    {
        return new Level2Code
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
