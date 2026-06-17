using System.ComponentModel.DataAnnotations.Schema;
using Domain.Common.Contracts;
using Domain.Entities.Catalog;

namespace Domain.Entities.Category;

public class ContractAppendix : AuditableEntity<Guid>
{
    public string AppendixNumber { get; protected set; } = string.Empty;
    public string? Description { get; protected set; }
    public Guid ContractNumberId { get; protected set; }

    [ForeignKey("ContractNumberId")]
    public virtual ContractNumber ContractNumber { get; protected set; } = null!;

    private IList<Contract> _contracts = new List<Contract>();
    public virtual IReadOnlyCollection<Contract> Contracts => _contracts.AsReadOnly();

    public static ContractAppendix Create(string appendixNumber, Guid contractNumberId, string? description = null)
    {
        return new ContractAppendix
        {
            AppendixNumber = appendixNumber,
            ContractNumberId = contractNumberId,
            Description = description
        };
    }

    public void Update(string appendixNumber, Guid contractNumberId, string? description = null)
    {
        AppendixNumber = appendixNumber;
        ContractNumberId = contractNumberId;
        Description = description;
    }
}
