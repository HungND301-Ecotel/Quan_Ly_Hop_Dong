using Domain.Common.Contracts;
using Domain.Entities.Catalog;

namespace Domain.Entities.Category;

public class Partner : AuditableEntity<Guid>
{
    public string Name { get; protected set; } = string.Empty;
    public string? TaxCode { get; protected set; }
    public string? Email { get; protected set; }
    public string? Phone { get; protected set; }
    public string? Address { get; protected set; }
    public string? ContactPerson { get; protected set; }

    // Navigation Properties
    private IList<Contract> _contracts = new List<Contract>();
    public virtual IReadOnlyCollection<Contract> Contracts => _contracts.AsReadOnly();
}
