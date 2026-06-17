using Domain.Common.Contracts;
using Domain.Entities.Catalog;

namespace Domain.Entities.Category;

public class ContractNumber : AuditableEntity<Guid>
{
    public string Number { get; protected set; } = string.Empty;
    public string? SignNumber { get; protected set; }
    public string? Description { get; protected set; }

    // Navigation
    private IList<ContractAppendix> _appendices = new List<ContractAppendix>();
    public virtual IReadOnlyCollection<ContractAppendix> Appendices => _appendices.AsReadOnly();

    private IList<Contract> _contracts = new List<Contract>();
    public virtual IReadOnlyCollection<Contract> Contracts => _contracts.AsReadOnly();

    public static ContractNumber Create(string number, string? signNumber = null, string? description = null)
    {
        return new ContractNumber
        {
            Number = number,
            SignNumber = signNumber,
            Description = description
        };
    }

    public void Update(string number, string? signNumber = null, string? description = null)
    {
        Number = number;
        SignNumber = signNumber;
        Description = description;
    }
}
