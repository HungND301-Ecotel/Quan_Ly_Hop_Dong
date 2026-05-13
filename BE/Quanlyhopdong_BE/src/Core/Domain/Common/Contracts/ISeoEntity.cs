namespace Domain.Common.Contracts;

/// <summary>
/// Interface for entities that need SEO (Search Engine Optimization) properties.
/// </summary>
public interface ISeoEntity
{
    /// <summary>
    /// Gets or sets the meta title for the entity.
    /// </summary>
    string? MetaTitle { get; set; }

    /// <summary>
    /// Gets or sets the meta description.
    /// </summary>
    string? MetaDescription { get; set; }

    /// <summary>
    /// Gets or sets the meta keywords.
    /// </summary>
    string? MetaKeywords { get; set; }

    /// <summary>
    /// Gets or sets the SEO-friendly URL slug.
    /// </summary>
    string? UrlSlug { get; set; }

    /// <summary>
    /// Gets or sets whether the entity should be indexed by search engines.
    /// </summary>
    bool? NoIndex { get; set; }

    /// <summary>
    /// Gets or sets whether search engines should follow links on the page.
    /// </summary>
    bool? NoFollow { get; set; }

    /// <summary>
    /// Gets or sets the canonical URL for the entity.
    /// </summary>
    string? CanonicalUrl { get; set; }

    /// <summary>
    /// Gets or sets the Open Graph title.
    /// </summary>
    string? OgTitle { get; set; }

    /// <summary>
    /// Gets or sets the Open Graph description.
    /// </summary>
    string? OgDescription { get; set; }

    /// <summary>
    /// Gets or sets the Open Graph image URL.
    /// </summary>
    string? OgImageUrl { get; set; }

    string? Author { get; set; }

    /// <summary>
    /// Mobile
    /// </summary>
    public string? Viewport { get; set; }

    public string? Hreflang { get; set; }
}