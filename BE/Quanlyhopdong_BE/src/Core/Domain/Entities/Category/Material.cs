using Domain.Common.Contracts;
using Domain.Entities.Catalog;

namespace Domain.Entities.Category;

public class Material : AuditableEntity
{
    public bool IsOtherMaterial { get; set; } = false;
    public string MaterialCode { get; protected set; } = string.Empty;
    public string Name { get; protected set; }
    public Guid? MaterialGroupId { get; protected set; }
    public Guid UnitOfMeasureId { get; protected set; }
    public virtual MaterialGroup? MaterialGroup { get; protected set; }
    public virtual UnitOfMeasure UnitOfMeasure { get; protected set; } = default!;
    public decimal Price { get; protected set; }
    public string Description { get; protected set; } = string.Empty;

    //Navitagion Properties
    private IList<ContractItem> _contractItems = new List<ContractItem>();
    public virtual IReadOnlyCollection<ContractItem> ContractItems => _contractItems.AsReadOnly();

    //Constructor
    public static Material Create(string materialCode, string name, Guid unitOfMeasureId, decimal price, bool isOtherMaterial = false, string description = "", Guid? materialGroupId = null)
    {
        if (price < 0)
        {
            throw new ArgumentException("Price is negative");
        }

        if (unitOfMeasureId == Guid.Empty)
        {
            throw new ArgumentException("UnitOfMeasureId is invalid", nameof(unitOfMeasureId));
        }

        return new Material
        {
            MaterialCode = materialCode,
            Name = name,
            MaterialGroupId = materialGroupId == Guid.Empty ? null : materialGroupId,
            UnitOfMeasureId = unitOfMeasureId,
            Description = description,
            Price = price,
            IsOtherMaterial = isOtherMaterial
        };
    }

    public void Update(string materialCode, string name, Guid unitOfMeasureId, decimal price, bool isOtherMaterial = false, string description = "", Guid? materialGroupId = null)
    {
        if (price < 0)
        {
            throw new ArgumentException("Price is negative");
        }

        if (unitOfMeasureId == Guid.Empty)
        {
            throw new ArgumentException("UnitOfMeasureId is invalid", nameof(unitOfMeasureId));
        }

        MaterialCode = materialCode;
        Name = name;
        MaterialGroupId = materialGroupId == Guid.Empty ? null : materialGroupId;
        IsOtherMaterial = isOtherMaterial;
        UnitOfMeasureId = unitOfMeasureId;
        Description = description;
        Price = price;
    }
}
