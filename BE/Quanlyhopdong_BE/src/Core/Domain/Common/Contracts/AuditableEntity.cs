using System.ComponentModel.DataAnnotations;

namespace Domain.Common.Contracts;

public abstract class AuditableEntity : AuditableEntity<Guid>;

public abstract class BasicAuditableEntity<T> : BaseEntity<T>, IAuditableEntity
{
    public Guid CreatedBy { get; set; }
    public DateTimeOffset CreatedOn { get; private set; } = DateTimeOffset.UtcNow;

    public Guid LastModifiedBy { get; set; }
    public DateTimeOffset? LastModifiedOn { get; set; } = DateTimeOffset.UtcNow;
}

public abstract class AuditableEntity<T> : BaseEntity<T>, IAuditableEntity, ISoftDelete
{
    public Guid CreatedBy { get; set; }
    public DateTimeOffset CreatedOn { get; private set; } = DateTimeOffset.UtcNow;
    public Guid LastModifiedBy { get; set; }
    public DateTimeOffset? LastModifiedOn { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? DeletedOn { get; set; }
    public Guid? DeletedBy { get; set; }
}

public abstract class SeoEntity<T> : BaseEntity<T>, IAuditableEntity, ISoftDelete, ISeoEntity
{
    public Guid CreatedBy { get; set; }
    public DateTimeOffset CreatedOn { get; private set; } = DateTimeOffset.UtcNow;
    public Guid LastModifiedBy { get; set; }
    public DateTimeOffset? LastModifiedOn { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? DeletedOn { get; set; }
    public Guid? DeletedBy { get; set; }

    /// <summary>
    /// Prefer 60
    /// </summary>
    [MaxLength(255)]
    public string? MetaTitle { get; set; }

    /// <summary>
    /// Prefer 160
    /// </summary>
    [MaxLength(1000)]
    public string? MetaDescription { get; set; }

    /// <summary>
    /// Prefer 255
    /// </summary>
    [MaxLength(1000)]
    public string? MetaKeywords { get; set; }

    /// <summary>
    /// Prefer 100
    /// </summary>
    [MaxLength(1000)]
    public string UrlSlug { get; set; } = string.Empty;

    public bool? NoIndex { get; set; }
    public bool? NoFollow { get; set; }

    [MaxLength(2083)]
    public string? CanonicalUrl { get; set; }

    /// <summary>
    /// Prefer 60
    /// </summary>
    [MaxLength(255)]
    public string? OgTitle { get; set; }

    /// <summary>
    /// Prefer 160
    /// </summary>
    [MaxLength(1000)]
    public string? OgDescription { get; set; }

    [MaxLength(2083)]
    public string? OgImageUrl { get; set; }

    [MaxLength(255)]
    public string? Author { get; set; }

    [MaxLength(255)]
    public string? Viewport { get; set; } = "idth=device-width, initial-scale=1.0";

    public string? Hreflang { get; set; }
}