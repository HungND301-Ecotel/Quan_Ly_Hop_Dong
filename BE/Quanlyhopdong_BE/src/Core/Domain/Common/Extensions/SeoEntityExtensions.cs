using Domain.Common.Contracts;

namespace Domain.Common.Extensions;

public static class SeoEntityExtensions
{
    /// <summary>
    /// Sets up SEO properties for an entity that implements ISeoEntity
    /// </summary>
    public static T SetupSeo<T>(this T entity,
        string? metaTitle = null,
        string? metaDescription = null,
        string? metaKeywords = null,
        string? urlSlug = null,
        bool? noIndex = null,
        bool? noFollow = null,
        string? canonicalUrl = null,
        string? ogTitle = null,
        string? ogDescription = null,
        string? ogImageUrl = null,
        string? author = null,
        string? viewport = null,
        string? hreflang = null
        ) where T : ISeoEntity
    {
        entity.MetaTitle = metaTitle ?? entity.MetaTitle;
        entity.MetaDescription = metaDescription ?? entity.MetaDescription;
        entity.MetaKeywords = metaKeywords ?? entity.MetaKeywords;
        entity.UrlSlug = urlSlug ?? entity.UrlSlug;
        entity.NoIndex = noIndex ?? entity.NoIndex;
        entity.NoFollow = noFollow ?? entity.NoFollow;
        entity.CanonicalUrl = canonicalUrl ?? entity.CanonicalUrl;
        entity.OgTitle = ogTitle ?? entity.OgTitle;
        entity.OgDescription = ogDescription ?? entity.OgDescription;
        entity.OgImageUrl = ogImageUrl ?? entity.OgImageUrl;
        entity.Author = author ?? entity.Author;
        entity.Viewport = viewport ?? entity.Viewport;
        entity.Hreflang = hreflang ?? entity.Hreflang;
        return entity;
    }
}