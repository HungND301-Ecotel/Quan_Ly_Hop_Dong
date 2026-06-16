using System.ComponentModel.DataAnnotations.Schema;
using Domain.Common.Contracts;
using Domain.Entities.Catalog;

namespace Domain.Entities.Category;

public class Level1Code : AuditableEntity<Guid>
{
    public string Code { get; protected set; } = string.Empty;
    public string? Description { get; protected set; }
    public Guid ContractTypeId { get; protected set; }
    public Guid? ContractRegisterId { get; protected set; }

    // Navigation Properties
    [ForeignKey("ContractTypeId")]
    public virtual ContractType ContractType { get; protected set; } = null!;

    [ForeignKey("ContractRegisterId")]
    public virtual ContractRegister? ContractRegister { get; protected set; }

    private IList<Level3Code> _level3Codes = new List<Level3Code>();
    public virtual IReadOnlyCollection<Level3Code> Level3Codes => _level3Codes.AsReadOnly();

    private IList<Contract> _contracts = new List<Contract>();
    public virtual IReadOnlyCollection<Contract> Contracts => _contracts.AsReadOnly();

    // Constructor
    public static Level1Code Create(string code, Guid contractTypeId, Guid? contractRegisterId, string? description = null)
    {
        return new Level1Code
        {
            Code = code,
            ContractTypeId = contractTypeId,
            ContractRegisterId = contractRegisterId,
            Description = description
        };
    }

    public void Update(string code, Guid contractTypeId, Guid? contractRegisterId, string? description = null)
    {
        Code = code;
        ContractTypeId = contractTypeId;
        ContractRegisterId = contractRegisterId;
        Description = description;
    }
}
