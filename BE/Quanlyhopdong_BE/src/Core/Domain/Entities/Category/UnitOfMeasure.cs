using Domain.Common.Contracts;

namespace Domain.Entities.Category;

public class UnitOfMeasure : AuditableEntity
{
    public string Code { get; protected set; } = string.Empty;
    public string Name { get; protected set; } = string.Empty;
    public bool IsActive { get; protected set; } = true;

    // Navigation Properties
    private IList<Material> _materials = new List<Material>();
    public virtual IReadOnlyCollection<Material> Materials => _materials.AsReadOnly();

    protected UnitOfMeasure() { }

    public static UnitOfMeasure Create(string code, string name, bool isActive = true)
    {
        if (string.IsNullOrWhiteSpace(code))
        {
            throw new ArgumentException("Code is required", nameof(code));
        }

        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException("Name is required", nameof(name));
        }

        return new UnitOfMeasure
        {
            Code = code,
            Name = name,
            IsActive = isActive
        };
    }

    public void Update(string code, string name, bool isActive)
    {
        if (string.IsNullOrWhiteSpace(code))
        {
            throw new ArgumentException("Code is required", nameof(code));
        }

        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException("Name is required", nameof(name));
        }

        Code = code;
        Name = name;
        IsActive = isActive;
    }
}
