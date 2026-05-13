using Domain.Common.Contracts;

namespace Domain.Entities.Category;

public class MaterialGroup : AuditableEntity
{
    public string GroupCode { get; protected set; } = string.Empty;
    public string Name { get; protected set; } = string.Empty;

    private IList<Material> _materials = new List<Material>();
    public virtual IReadOnlyCollection<Material> Materials => _materials.AsReadOnly();

    public void Update(string groupCode, string name)
    {
        if (string.IsNullOrWhiteSpace(groupCode) || string.IsNullOrWhiteSpace(name))
        {
            throw new AggregateException("MaterialGroup code & name cannot be null or empty");
        }

        GroupCode = groupCode;
        Name = name;
    }
}
