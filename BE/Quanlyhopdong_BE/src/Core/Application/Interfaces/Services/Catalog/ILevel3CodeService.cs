using Application.Dto.Catalog;

namespace Application.Interfaces.Services.Catalog;

public interface ILevel3CodeService
{
    Task<IList<Level3CodeDto>> GetAllAsync(string? search);
    Task<Level3CodeDto?> GetByIdAsync(Guid id);
    Task<IList<Level3CodeLookupDto>> GetByLevel1CodeIdAsync(Guid level1CodeId);
    Task<Guid> CreateAsync(string code, Guid level1CodeId, Guid? level2CodeId = null, string? description = null);
    Task<bool> UpdateAsync(Guid id, string code, Guid level1CodeId, Guid? level2CodeId = null, string? description = null);
    Task<bool> DeleteAsync(IList<Guid> deleteIds);
}
