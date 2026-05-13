using Application.Common.Exceptions;
using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using Domain.Entities.Category;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services.Catalog;

public class Level3CodeService(IUnitOfWork unitOfWork) : ILevel3CodeService
{
    private readonly IWriteRepository<Level3Code> _level3CodeRepo = unitOfWork.GetRepository<Level3Code>();
    private readonly IWriteRepository<Level1Code> _level1CodeRepo = unitOfWork.GetRepository<Level1Code>();

    public async Task<IList<Level3CodeDto>> GetAllAsync(string? search)
    {
        search = search ?? string.Empty;
        var list = await _level3CodeRepo.GetAllAsync(
            predicate: x => x.Code.Contains(search) || x.Description.Contains(search),
            include: q => q.Include(x => x.Level1Code),
            disableTracking: true);
        
        return list.Select(x => new Level3CodeDto
        {
            Id = x.Id,
            Code = x.Code,
            Description = x.Description,
            Level1CodeId = x.Level1CodeId,
            Level1CodeName = x.Level1Code.Code
        }).ToList();
    }

    public async Task<Level3CodeDto?> GetByIdAsync(Guid id)
    {
        var entity = await _level3CodeRepo.GetFirstOrDefaultAsync(
            predicate: x => x.Id == id,
            include: q => q.Include(x => x.Level1Code),
            disableTracking: true);
        
        if (entity == null)
        {
            return null;
        }

        return new Level3CodeDto
        {
            Id = entity.Id,
            Code = entity.Code,
            Description = entity.Description,
            Level1CodeId = entity.Level1CodeId,
            Level1CodeName = entity.Level1Code.Code
        };
    }

    public async Task<IList<Level3CodeLookupDto>> GetByLevel1CodeIdAsync(Guid level1CodeId)
    {
        var list = await _level3CodeRepo.GetAllAsync(
            predicate: x => x.Level1CodeId == level1CodeId,
            orderBy: q => q.OrderBy(x => x.Code),
            disableTracking: true);

        return list.Select(x => new Level3CodeLookupDto
        {
            Id = x.Id,
            Name = x.Code
        }).ToList();
    }

    public async Task<Guid> CreateAsync(string code, Guid level1CodeId, string? description = null)
    {
        // Validate Level1Code exists
        var level1Code = await _level1CodeRepo.FindAsync(level1CodeId);
        if (level1Code == null)
        {
            throw new NotFoundException("Level1Code not found");
        }

        // Check for duplicate code
        var isDuplicate = await _level3CodeRepo.AnyAsync(x => x.Code == code.ToUpper().Trim());
        if (isDuplicate)
        {
            throw new ConflictException($"Code '{code}' đã tồn tại");
        }

        var entity = Level3Code.Create(code, level1CodeId, description);
        await _level3CodeRepo.InsertAsync(entity);
        await unitOfWork.SaveChangesAsync();
        return entity.Id;
    }

    public async Task<bool> UpdateAsync(Guid id, string code, Guid level1CodeId, string? description = null)
    {
        var entity = await _level3CodeRepo.GetFirstOrDefaultAsync(
            predicate: x => x.Id == id,
            disableTracking: false);
        
        if (entity == null)
        {
            throw new NotFoundException($"Level3Code với Id '{id}' không tìm thấy");
        }

        // Validate Level1Code exists
        var level1Code = await _level1CodeRepo.FindAsync(level1CodeId);
        if (level1Code == null)
        {
            throw new NotFoundException("Level1Code not found");
        }

        // Check for duplicate code
        var isDuplicate = await _level3CodeRepo.AnyAsync(x => x.Code == code.ToUpper().Trim() && x.Id != id);
        if (isDuplicate)
        {
            throw new ConflictException($"Code '{code}' đã tồn tại");
        }

        entity.Update(code, level1CodeId, description);
        _level3CodeRepo.Update(entity);
        await unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(IList<Guid> deleteIds)
    {
        var entities = await _level3CodeRepo.GetAllAsync(
            predicate: x => deleteIds.Contains(x.Id),
            disableTracking: false);

        if (entities.Count == 0)
        {
            throw new NotFoundException("Không tìm thấy Level3Code nào để xóa");
        }

        foreach (var entity in entities)
        {
            _level3CodeRepo.Delete(entity);
        }

        await unitOfWork.SaveChangesAsync();
        return true;
    }
}
