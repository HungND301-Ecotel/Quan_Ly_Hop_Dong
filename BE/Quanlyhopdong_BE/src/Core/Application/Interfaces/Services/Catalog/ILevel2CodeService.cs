using Application.Dto.Catalog;

namespace Application.Interfaces.Services.Catalog;

public interface ILevel2CodeService
{
    Task<IList<Level2CodeDto>> GetAllAsync(string? search);
    Task<Level2CodeDto?> GetByIdAsync(Guid id);
    Task<IList<Level2CodeLookupDto>> GetByLevel1CodeIdAsync(Guid level1CodeId);
    Task<Guid> CreateAsync(string code, Guid level1CodeId, string? description = null);
    Task<bool> UpdateAsync(Guid id, string code, Guid level1CodeId, string? description = null);
    Task<bool> DeleteAsync(IList<Guid> deleteIds);
}
