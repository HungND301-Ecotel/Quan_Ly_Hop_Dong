using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using Domain.Entities.Category;
using Mapster;

namespace Infrastructure.Services.Catalog;

public class ContractStructureCatalogService(IUnitOfWork unitOfWork) : IContractStructureCatalogService
{
    private readonly IWriteRepository<ContractStructureCatalog> _contractStructureRepo = unitOfWork.GetRepository<ContractStructureCatalog>();
    private readonly IWriteRepository<Domain.Entities.Catalog.Contract> _contractRepo = unitOfWork.GetRepository<Domain.Entities.Catalog.Contract>();

    public async Task<IList<ContractStructureCatalogDto>> GetAllAsync(string? search, bool? isActive = null)
    {
        search ??= string.Empty;
        var list = await _contractStructureRepo.GetAllAsync(
            predicate: x => (x.Name.Contains(search) || x.Code.Contains(search))
                            && (isActive == null || x.IsActive == isActive),
            disableTracking: true);

        return list.Adapt<List<ContractStructureCatalogDto>>();
    }

    public async Task<ContractStructureCatalogDto?> GetByIdAsync(Guid id)
    {
        var entity = await _contractStructureRepo.GetFirstOrDefaultAsync(
            predicate: x => x.Id == id,
            disableTracking: true);

        return entity?.Adapt<ContractStructureCatalogDto>();
    }

    public async Task<Guid> CreateAsync(string name, string? code, string? description, bool isActive = true)
    {
        var normalizedName = name.Trim();
        var normalizedCode = code?.Trim() ?? string.Empty;
        var isDuplicateName = await _contractStructureRepo.AnyAsync(x => x.Name.ToLower() == normalizedName.ToLower());
        if (isDuplicateName)
        {
            throw new ArgumentException($"Name '{name}' already exists.");
        }
        if (!string.IsNullOrWhiteSpace(normalizedCode))
        {
            var isDuplicateCode = await _contractStructureRepo.AnyAsync(x => x.Code.ToLower() == normalizedCode.ToLower());
            if (isDuplicateCode)
            {
                throw new ArgumentException($"Code '{code}' already exists.");
            }
        }

        var entity = ContractStructureCatalog.Create(normalizedName, normalizedCode, description, isActive);
        await _contractStructureRepo.InsertAsync(entity);
        await unitOfWork.SaveChangesAsync();
        return entity.Id;
    }

    public async Task<bool> UpdateAsync(Guid id, string name, string? code, string? description, bool isActive)
    {
        var entity = await _contractStructureRepo.GetFirstOrDefaultAsync(
            predicate: x => x.Id == id,
            disableTracking: false);

        if (entity is null)
        {
            throw new KeyNotFoundException($"ContractStructureCatalog with Id '{id}' was not found.");
        }

        var normalizedName = name.Trim();
        var normalizedCode = code?.Trim() ?? string.Empty;
        var isDuplicateName = await _contractStructureRepo.AnyAsync(x => x.Name.ToLower() == normalizedName.ToLower() && x.Id != id);
        if (isDuplicateName)
        {
            throw new ArgumentException($"Name '{name}' already exists.");
        }
        if (!string.IsNullOrWhiteSpace(normalizedCode))
        {
            var isDuplicateCode = await _contractStructureRepo.AnyAsync(x => x.Code.ToLower() == normalizedCode.ToLower() && x.Id != id);
            if (isDuplicateCode)
            {
                throw new ArgumentException($"Code '{code}' already exists.");
            }
        }

        entity.Update(normalizedName, normalizedCode, description, isActive);
        await unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var entity = await _contractStructureRepo.GetFirstOrDefaultAsync(
            predicate: x => x.Id == id,
            disableTracking: false);

        if (entity is null)
        {
            throw new KeyNotFoundException($"ContractStructureCatalog with Id '{id}' was not found.");
        }

        var isUsed = await _contractRepo.AnyAsync(x => x.ContractStructureId == id && x.DeletedOn == null);
        if (isUsed)
        {
            throw new ArgumentException("Cannot delete a contract structure that is already used by contracts.");
        }

        _contractStructureRepo.Delete(entity);
        await unitOfWork.SaveChangesAsync();
        return true;
    }
}
