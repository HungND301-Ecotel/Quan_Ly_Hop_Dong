using Domain.Common.Contracts;

namespace Domain.Entities.Identity;

public class Position : AuditableEntity<Guid>
{
    public string Name { get; protected set; } = string.Empty;
    public string Code { get; protected set; } = string.Empty;
    public int? Level { get; protected set; }
    public string? Description { get; protected set; }

    // Navigation Properties

    private IList<User> _users = new List<User>();
    public virtual IReadOnlyCollection<User> Users => _users.AsReadOnly();

    //Constructor
    public static Position Create(string name, string code, int? level, string? description)
    {
        return new Position
        {
            Code = code,
            Name = name,
            Level = level,
            Description = description
        };
    }
}
