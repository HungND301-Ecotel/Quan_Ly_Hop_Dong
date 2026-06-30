using Application.Common.Exceptions;
using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using Domain.Entities.Catalog;
using Domain.Entities.Category;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services.Catalog;

public class SignedContentService(IUnitOfWork unitOfWork) : ISignedContentService
{
    private readonly IWriteRepository<SignedContent> _signedContentRepo = unitOfWork.GetRepository<SignedContent>();
    private readonly IWriteRepository<Level3Code> _level3CodeRepo = unitOfWork.GetRepository<Level3Code>();

    public async Task<IList<SignedContentDto>> GetAllAsync(string? search)
    {
        search = search ?? string.Empty;
        var list = await _signedContentRepo.GetAllAsync(
            predicate: x => x.Title.Contains(search),
            include: q => q
                .Include(x => x.Level3Code),
            disableTracking: true);
        
        return list.Select(x => new SignedContentDto
        {
            Id = x.Id,
            Title = x.Title,
            Level3CodeId = x.Level3CodeId,
            Level3CodeName = x.Level3Code.Code,
            Description = x.Description
        }).ToList();
    }

    public async Task<SignedContentDto?> GetByIdAsync(Guid id)
    {
        var entity = await _signedContentRepo.GetFirstOrDefaultAsync(
            predicate: x => x.Id == id,
            include: q => q
                .Include(x => x.Level3Code),
            disableTracking: true);
        
        if (entity == null)
        {
            return null;
        }

        return new SignedContentDto
        {
            Id = entity.Id,
            Title = entity.Title,
            Level3CodeId = entity.Level3CodeId,
            Level3CodeName = entity.Level3Code.Code,
            Description = entity.Description
        };
    }

    public async Task<IList<SignedContentLookupDto>> GetByLevel3CodeIdAsync(Guid level3CodeId)
    {
        var list = await _signedContentRepo.GetAllAsync(
            predicate: x => x.Level3CodeId == level3CodeId,
            orderBy: q => q.OrderBy(x => x.Title),
            disableTracking: true);

        return list.Select(x => new SignedContentLookupDto
        {
            Id = x.Id,
            Name = x.Title
        }).ToList();
    }

    public async Task<Guid> CreateAsync(string title, Guid level3CodeId, string? description)
    {
        // Validate Level3Code exists
        var level3Code = await _level3CodeRepo.FindAsync(level3CodeId);
        if (level3Code == null)
        {
            throw new NotFoundException("Level3Code not found");
        }

        // Check 1-1 mapping duplicate: each Level3Code can only be linked to one SignedContent
        bool isLevel3CodeAssigned = await _signedContentRepo.AnyAsync(x => x.Level3CodeId == level3CodeId);
        if (isLevel3CodeAssigned)
        {
            throw new ConflictException("Level3Code đã được gắn với SignedContent khác");
        }

        var entity = SignedContent.Create(title, level3CodeId, description);
        await _signedContentRepo.InsertAsync(entity);
        await unitOfWork.SaveChangesAsync();
        return entity.Id;
    }

    public async Task<bool> UpdateAsync(Guid id, string title, Guid level3CodeId, string? description)
    {
        var entity = await _signedContentRepo.GetFirstOrDefaultAsync(
            predicate: x => x.Id == id,
            disableTracking: false);
        
        if (entity == null)
        {
            throw new NotFoundException($"SignedContent với Id '{id}' không tìm thấy");
        }

        // Validate Level3Code exists
        var level3Code = await _level3CodeRepo.FindAsync(level3CodeId);
        if (level3Code == null)
        {
            throw new NotFoundException("Level3Code not found");
        }

        // Check 1-1 mapping duplicate: each Level3Code can only be linked to one SignedContent
        bool isLevel3CodeAssigned = await _signedContentRepo.AnyAsync(x => x.Level3CodeId == level3CodeId && x.Id != id);
        if (isLevel3CodeAssigned)
        {
            throw new ConflictException("Level3Code đã được gắn với SignedContent khác");
        }

        entity.Update(title, level3CodeId, description);
        _signedContentRepo.Update(entity);
        await unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(IList<Guid> deleteIds)
    {
        var entities = await _signedContentRepo.GetAllAsync(
            predicate: x => deleteIds.Contains(x.Id),
            disableTracking: false);

        if (entities.Count == 0)
        {
            throw new NotFoundException("Không tìm thấy SignedContent nào để xóa");
        }

        foreach (var entity in entities)
        {
            _signedContentRepo.Delete(entity);
        }

        await unitOfWork.SaveChangesAsync();
        return true;
    }
}
