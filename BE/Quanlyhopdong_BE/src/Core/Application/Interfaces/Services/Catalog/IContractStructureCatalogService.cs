using Application.Dto.Catalog;

namespace Application.Interfaces.Services.Catalog;

public interface IContractStructureCatalogService
{
    Task<IList<ContractStructureCatalogDto>> GetAllAsync(string? search);
    Task<ContractStructureCatalogDto?> GetByIdAsync(Guid id);
    Task<Guid> CreateAsync(string name, string code, string? description);
    Task<bool> UpdateAsync(Guid id, string name, string code, string? description, bool isActive);
    Task<bool> DeleteAsync(Guid id);
}
