using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using Domain.Entities.Category;
using Mapster;

namespace Infrastructure.Services.Catalog;

public class UnitOfMeasureService(
    IUnitOfWork unitOfWork) : IUnitOfMeasureService
{
    private readonly IWriteRepository<UnitOfMeasure> _unitOfMeasureRepo = unitOfWork.GetRepository<UnitOfMeasure>();

    public async Task<IList<UnitOfMeasureDto>> GetAllAsync(string? search)
    {
        search = search ?? string.Empty;
        var list = await _unitOfMeasureRepo.GetAllAsync(
            predicate: x => x.Code.Contains(search) || x.Name.Contains(search),
            disableTracking: true);
        return list.Adapt<List<UnitOfMeasureDto>>();
    }

    public async Task<UnitOfMeasureDto?> GetByIdAsync(Guid id)
    {
        var entity = await _unitOfMeasureRepo.GetFirstOrDefaultAsync(
            predicate: x => x.Id == id,
            disableTracking: true);
        return entity?.Adapt<UnitOfMeasureDto>();
    }

    public async Task<Guid> CreateAsync(string code, string name, string? note = null)
    {
        var isDuplicate = await _unitOfMeasureRepo.AnyAsync(x => x.Code == code.ToUpper().Trim());
        if (isDuplicate)
        {
            throw new ArgumentException($"Code '{code}' đã tồn tại.");
        }
        var entity = UnitOfMeasure.Create(code, name, true, note);
        await _unitOfMeasureRepo.InsertAsync(entity);
        await unitOfWork.SaveChangesAsync();
        return entity.Id;
    }

    public async Task<bool> UpdateAsync(Guid id, string code, string name, bool isActive, string? note)
    {
        var entity = await _unitOfMeasureRepo.GetFirstOrDefaultAsync(
            predicate: x => x.Id == id,
            disableTracking: false);
        if (entity is null)
        {
            throw new KeyNotFoundException($"Không tìm thấy UnitOfMeasure với Id '{id}'.");
        }

        var isDuplicate = await _unitOfMeasureRepo.AnyAsync(x => x.Code == code.ToUpper().Trim() && x.Id != id);
        if (isDuplicate)
        {
            throw new ArgumentException($"Code '{code}' đã tồn tại.");
        }

        entity.Update(code, name, isActive, note);
        _unitOfMeasureRepo.Update(entity);
        await unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var entity = await _unitOfMeasureRepo.GetFirstOrDefaultAsync(
            predicate: x => x.Id == id,
            disableTracking: false);
        if (entity is null)
        {
            throw new KeyNotFoundException($"Không tìm thấy UnitOfMeasure với Id '{id}'.");
        }

        _unitOfMeasureRepo.Delete(entity);
        await unitOfWork.SaveChangesAsync();
        return true;
    }
}
