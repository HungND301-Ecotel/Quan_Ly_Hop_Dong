using Application.Dto.Catalog;

namespace Application.Interfaces.Services.Catalog;

public interface IContractStructureCatalogService
{
    Task<IList<ContractStructureCatalogDto>> GetAllAsync(string? search);
    Task<ContractStructureCatalogDto?> GetByIdAsync(Guid id);
    Task<Guid> CreateAsync(string name);
    Task<bool> UpdateAsync(Guid id, string name, bool isActive);
    Task<bool> DeleteAsync(Guid id);
}
