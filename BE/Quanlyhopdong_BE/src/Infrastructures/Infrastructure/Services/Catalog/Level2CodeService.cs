using Application.Common.Exceptions;
using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using Domain.Entities.Category;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services.Catalog;

public class Level2CodeService(IUnitOfWork unitOfWork) : ILevel2CodeService
{
    private readonly IWriteRepository<Level2Code> _level2CodeRepo = unitOfWork.GetRepository<Level2Code>();
    private readonly IWriteRepository<Level1Code> _level1CodeRepo = unitOfWork.GetRepository<Level1Code>();

    public async Task<IList<Level2CodeDto>> GetAllAsync(string? search)
    {
        search = search ?? string.Empty;
        var list = await _level2CodeRepo.GetAllAsync(
            predicate: x => x.Code.Contains(search) || (x.Description != null && x.Description.Contains(search)),
            include: q => q.Include(x => x.Level1Code),
            disableTracking: true);
        
        return list.Select(x => new Level2CodeDto
        {
            Id = x.Id,
            Code = x.Code,
            Description = x.Description,
            Level1CodeId = x.Level1CodeId,
            Level1CodeName = x.Level1Code.Code
        }).ToList();
    }

    public async Task<Level2CodeDto?> GetByIdAsync(Guid id)
    {
        var entity = await _level2CodeRepo.GetFirstOrDefaultAsync(
            predicate: x => x.Id == id,
            include: q => q.Include(x => x.Level1Code),
            disableTracking: true);
        
        if (entity == null)
        {
            return null;
        }

        return new Level2CodeDto
        {
            Id = entity.Id,
            Code = entity.Code,
            Description = entity.Description,
            Level1CodeId = entity.Level1CodeId,
            Level1CodeName = entity.Level1Code.Code
        };
    }

    public async Task<IList<Level2CodeLookupDto>> GetByLevel1CodeIdAsync(Guid level1CodeId)
    {
        var list = await _level2CodeRepo.GetAllAsync(
            predicate: x => x.Level1CodeId == level1CodeId,
            orderBy: q => q.OrderBy(x => x.Code),
            disableTracking: true);

        return list.Select(x => new Level2CodeLookupDto
        {
            Id = x.Id,
            Code = x.Code
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
        var isDuplicate = await _level2CodeRepo.AnyAsync(x => x.Code == code.ToUpper().Trim());
        if (isDuplicate)
        {
            throw new ConflictException($"Code '{code}' đã tồn tại");
        }

        var entity = Level2Code.Create(code, level1CodeId, description);
        await _level2CodeRepo.InsertAsync(entity);
        await unitOfWork.SaveChangesAsync();
        return entity.Id;
    }

    public async Task<bool> UpdateAsync(Guid id, string code, Guid level1CodeId, string? description = null)
    {
        var entity = await _level2CodeRepo.GetFirstOrDefaultAsync(
            predicate: x => x.Id == id,
            disableTracking: false);
        
        if (entity == null)
        {
            throw new NotFoundException($"Level2Code với Id '{id}' không tìm thấy");
        }

        // Validate Level1Code exists
        var level1Code = await _level1CodeRepo.FindAsync(level1CodeId);
        if (level1Code == null)
        {
            throw new NotFoundException("Level1Code not found");
        }

        // Check for duplicate code
        var isDuplicate = await _level2CodeRepo.AnyAsync(x => x.Code == code.ToUpper().Trim() && x.Id != id);
        if (isDuplicate)
        {
            throw new ConflictException($"Code '{code}' đã tồn tại");
        }

        entity.Update(code, level1CodeId, description);
        _level2CodeRepo.Update(entity);
        await unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(IList<Guid> deleteIds)
    {
        var entities = await _level2CodeRepo.GetAllAsync(
            predicate: x => deleteIds.Contains(x.Id),
            disableTracking: false);

        if (entities.Count == 0)
        {
            throw new NotFoundException("Không tìm thấy Level2Code nào để xóa");
        }

        foreach (var entity in entities)
        {
            _level2CodeRepo.Delete(entity);
        }

        await unitOfWork.SaveChangesAsync();
        return true;
    }
}
