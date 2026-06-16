using System.ComponentModel.DataAnnotations.Schema;
using Domain.Common.Contracts;
using Domain.Entities.Catalog;
using Domain.Entities.Identity;

namespace Domain.Entities.Category;

public class Partner : AuditableEntity<Guid>
{
    public string Name { get; protected set; } = string.Empty;
    public string? TaxCode { get; protected set; }
    public string? Email { get; protected set; }
    public string? Phone { get; protected set; }
    public string? Address { get; protected set; }
    public string? ContactPerson { get; protected set; }
    public Guid? BankId { get; protected set; }
    public string? Fax { get; protected set; }
    public Guid? PositionId { get; protected set; }

    // Navigation Properties
    [ForeignKey("BankId")]
    public virtual BankAccount? Bank { get; protected set; }

    [ForeignKey("PositionId")]
    public virtual Position? Position { get; protected set; }

    private IList<Contract> _contracts = new List<Contract>();
    public virtual IReadOnlyCollection<Contract> Contracts => _contracts.AsReadOnly();
}
