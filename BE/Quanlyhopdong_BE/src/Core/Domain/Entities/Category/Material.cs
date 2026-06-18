using Domain.Common.Contracts;
using Domain.Entities.Catalog;

namespace Domain.Entities.Category;

public class Material : AuditableEntity
{
    public bool IsOtherMaterial { get; set; } = false;
    public bool IsSynced { get; set; } = false;
    public string MaterialCode { get; protected set; } = string.Empty;
    public string Name { get; protected set; }
    public Guid? MaterialGroupId { get; protected set; }
    public Guid? UnitOfMeasureId { get; protected set; }
    public virtual MaterialGroup? MaterialGroup { get; protected set; }
    public virtual UnitOfMeasure? UnitOfMeasure { get; protected set; }
    public decimal? Price { get; protected set; }
    public string Description { get; protected set; } = string.Empty;

    //Navitagion Properties
    private IList<ContractItem> _contractItems = new List<ContractItem>();
    public virtual IReadOnlyCollection<ContractItem> ContractItems => _contractItems.AsReadOnly();

    //Constructor
    public static Material Create(string materialCode, string name, Guid? unitOfMeasureId, decimal? price, bool isOtherMaterial = false, string description = "", Guid? materialGroupId = null, bool isSynced = false)
    {
        if (price.HasValue && price.Value < 0)
        {
            throw new ArgumentException("Price is negative");
        }

        return new Material
        {
            MaterialCode = materialCode,
            Name = name,
            MaterialGroupId = materialGroupId == Guid.Empty ? null : materialGroupId,
            UnitOfMeasureId = unitOfMeasureId == Guid.Empty ? null : unitOfMeasureId,
            Description = description,
            Price = price,
            IsOtherMaterial = isOtherMaterial,
            IsSynced = isSynced
        };
    }

    public void Update(string materialCode, string name, Guid? unitOfMeasureId, decimal? price, bool isOtherMaterial = false, string description = "", Guid? materialGroupId = null, bool isSynced = false)
    {
        if (price.HasValue && price.Value < 0)
        {
            throw new ArgumentException("Price is negative");
        }

        MaterialCode = materialCode;
        Name = name;
        MaterialGroupId = materialGroupId == Guid.Empty ? null : materialGroupId;
        IsOtherMaterial = isOtherMaterial;
        UnitOfMeasureId = unitOfMeasureId == Guid.Empty ? null : unitOfMeasureId;
        Description = description;
        Price = price;
        IsSynced = isSynced;
    }
}
