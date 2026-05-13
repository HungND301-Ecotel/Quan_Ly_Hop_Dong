using Application.Common.Exceptions;
using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using Domain.Entities.Category;
using Microsoft.EntityFrameworkCore;
using Mapster;

namespace Infrastructure.Services.Catalog;

public class Level1CodeService(IUnitOfWork unitOfWork) : ILevel1CodeService
{
    private readonly IWriteRepository<Level1Code> _level1CodeRepo = unitOfWork.GetRepository<Level1Code>();
    private readonly IWriteRepository<ContractType> _contractTypeRepo = unitOfWork.GetRepository<ContractType>();

    public async Task<IList<Level1CodeDto>> GetAllAsync(string? search)
    {
        search = search ?? string.Empty;
        var list = await _level1CodeRepo.GetAllAsync(
            predicate: x => x.Code.Contains(search) || x.Description.Contains(search),
            include: q => q.Include(x => x.ContractType),
            disableTracking: true);
        
        return list.Select(x => new Level1CodeDto
        {
            Id = x.Id,
            Code = x.Code,
            Description = x.Description,
            ContractTypeId = x.ContractTypeId,
            ContractTypeName = x.ContractType.Name
        }).ToList();
    }

    public async Task<Level1CodeDto?> GetByIdAsync(Guid id)
    {
        var entity = await _level1CodeRepo.GetFirstOrDefaultAsync(
            predicate: x => x.Id == id,
            include: q => q.Include(x => x.ContractType),
            disableTracking: true);
        
        if (entity == null)
        {
            return null;
        }

        return new Level1CodeDto
        {
            Id = entity.Id,
            Code = entity.Code,
            Description = entity.Description,
            ContractTypeId = entity.ContractTypeId,
            ContractTypeName = entity.ContractType.Name
        };
    }

    public async Task<Guid> CreateAsync(string code, Guid contractTypeId, string? description = null)
    {
        // Validate ContractType exists
        var contractType = await _contractTypeRepo.FindAsync(contractTypeId);
        if (contractType == null)
        {
            throw new NotFoundException("ContractType not found");
        }

        // Check 1-1 mapping duplicate: each ContractType can only be linked to one Level1Code
        bool isContractTypeAssigned = await _level1CodeRepo.AnyAsync(x => x.ContractTypeId == contractTypeId);
        if (isContractTypeAssigned)
        {
            throw new ConflictException("ContractType đã được gắn với Level1Code khác");
        }

        // Check for duplicate code
        bool isDuplicate = await _level1CodeRepo.AnyAsync(x => x.Code == code.ToUpperInvariant().Trim());
        if (isDuplicate)
        {
            throw new ConflictException($"Code '{code}' đã tồn tại");
        }

        var entity = Level1Code.Create(code, contractTypeId, description);
        await _level1CodeRepo.InsertAsync(entity);
        await unitOfWork.SaveChangesAsync();
        return entity.Id;
    }

    public async Task<bool> UpdateAsync(Guid id, string code, Guid contractTypeId, string? description = null)
    {
        var entity = await _level1CodeRepo.GetFirstOrDefaultAsync(
            predicate: x => x.Id == id,
            disableTracking: false);
        
        if (entity == null)
        {
            throw new NotFoundException($"Level1Code với Id '{id}' không tìm thấy");
        }

        // Validate ContractType exists
        var contractType = await _contractTypeRepo.FindAsync(contractTypeId);
        if (contractType == null)
        {
            throw new NotFoundException("ContractType not found");
        }

        // Check 1-1 mapping duplicate: each ContractType can only be linked to one Level1Code
        bool isContractTypeAssigned = await _level1CodeRepo.AnyAsync(x => x.ContractTypeId == contractTypeId && x.Id != id);
        if (isContractTypeAssigned)
        {
            throw new ConflictException("ContractType đã được gắn với Level1Code khác");
        }

        // Check for duplicate code
        bool isDuplicate = await _level1CodeRepo.AnyAsync(x => x.Code == code.ToUpperInvariant().Trim() && x.Id != id);
        if (isDuplicate)
        {
            throw new ConflictException($"Code '{code}' đã tồn tại");
        }

        entity.Update(code, contractTypeId, description);
        _level1CodeRepo.Update(entity);
        await unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(IList<Guid> deleteIds)
    {
        var entities = await _level1CodeRepo.GetAllAsync(
            predicate: x => deleteIds.Contains(x.Id),
            disableTracking: false);

        if (entities.Count == 0)
        {
            throw new NotFoundException("Không tìm thấy Level1Code nào để xóa");
        }

        foreach (var entity in entities)
        {
            _level1CodeRepo.Delete(entity);
        }

        await unitOfWork.SaveChangesAsync();
        return true;
    }
}
