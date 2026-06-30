using System.ComponentModel.DataAnnotations;
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

    [MaxLength(250)]
    public string? Position { get; protected set; }

    [MaxLength(1000)]
    public string? Note { get; protected set; }

    [MaxLength(100)]
    public string? PartnerContractCode { get; protected set; }

    // Navigation Properties
    [ForeignKey("BankId")]
    public virtual BankAccount? Bank { get; protected set; }

    private IList<Contract> _contracts = new List<Contract>();
    public virtual IReadOnlyCollection<Contract> Contracts => _contracts.AsReadOnly();
}
