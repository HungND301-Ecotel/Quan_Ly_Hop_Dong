using System.ComponentModel.DataAnnotations.Schema;
using Domain.Common.Contracts;
using Domain.Entities.Category;

namespace Domain.Entities.Catalog;

public class SignedContent : AuditableEntity<Guid>
{
    public string Title { get; protected set; } = string.Empty;
    public Guid Level3CodeId { get; protected set; }

    // Navigation Properties
    [ForeignKey("Level3CodeId")]
    public virtual Level3Code Level3Code { get; protected set; } = null!;

    private readonly IList<Contract> _contracts = new List<Contract>();
    public virtual IReadOnlyCollection<Contract> Contracts => _contracts.AsReadOnly();

    // Constructor
    public static SignedContent Create(string title, Guid level3CodeId)
    {
        return new SignedContent
        {
            Title = title,
            Level3CodeId = level3CodeId
        };
    }

    public void Update(string title, Guid level3CodeId)
    {
        Title = title;
        Level3CodeId = level3CodeId;
    }
}
