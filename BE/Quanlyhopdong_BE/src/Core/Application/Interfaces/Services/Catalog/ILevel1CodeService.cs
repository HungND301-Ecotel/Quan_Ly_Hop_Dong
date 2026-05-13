using Application.Dto.Catalog;

namespace Application.Interfaces.Services.Catalog;

public interface ILevel1CodeService
{
    Task<IList<Level1CodeDto>> GetAllAsync(string? search);
    Task<Level1CodeDto?> GetByIdAsync(Guid id);
    Task<Guid> CreateAsync(string code, Guid contractTypeId, string? description = null);
    Task<bool> UpdateAsync(Guid id, string code, Guid contractTypeId, string? description = null);
    Task<bool> DeleteAsync(IList<Guid> deleteIds);
}
