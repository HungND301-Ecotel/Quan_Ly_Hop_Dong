using Application.Dto.Catalog;

namespace Application.Interfaces.Services.Catalog;

public interface ISignedContentService
{
    Task<IList<SignedContentDto>> GetAllAsync(string? search);
    Task<SignedContentDto?> GetByIdAsync(Guid id);
    Task<IList<SignedContentLookupDto>> GetByLevel3CodeIdAsync(Guid level3CodeId);
    Task<Guid> CreateAsync(string title, Guid level3CodeId);
    Task<bool> UpdateAsync(Guid id, string title, Guid level3CodeId);
    Task<bool> DeleteAsync(IList<Guid> deleteIds);
}
