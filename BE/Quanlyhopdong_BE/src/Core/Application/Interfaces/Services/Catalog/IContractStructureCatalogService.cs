using Application.Dto.Catalog;

namespace Application.Interfaces.Services.Catalog;

public interface IContractStructureCatalogService
{
    Task<IList<ContractStructureCatalogDto>> GetAllAsync(string? search, bool? isActive = null);
    Task<ContractStructureCatalogDto?> GetByIdAsync(Guid id);
    Task<Guid> CreateAsync(string name, string? code, string? description, bool isActive = true);
    Task<bool> UpdateAsync(Guid id, string name, string? code, string? description, bool isActive);
    Task<bool> DeleteAsync(Guid id);
}
