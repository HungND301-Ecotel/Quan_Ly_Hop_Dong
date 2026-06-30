using Application.Common.Exceptions;
using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using Domain.Entities.Category;
using Mapster;
using Shared.Constants;

namespace Infrastructure.Services.Catalog;

public class DepartmentService(IUnitOfWork unitOfWork) : IDepartmentService
{
    private readonly IWriteRepository<Department> _departmentRepo = unitOfWork.GetRepository<Department>();

    public async Task<bool> CreateAsync(CreateDepartmentDto dto)
    {
        var insertDepartment = dto.Adapt<Department>();
        await _departmentRepo.InsertAsync(insertDepartment);
        await unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var department = await _departmentRepo.GetFirstOrDefaultAsync(
            predicate: d => d.Id == id,
            disableTracking: true
            ) ?? throw new NotFoundException("Department is not found");

        _departmentRepo.Delete(department);
        await unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(IList<Guid> deleteIds)
    {
        var distinctIds = deleteIds.Distinct().ToList();

        if (distinctIds.Count != deleteIds.Count)
        {
            throw new ConflictException(CustomResponseMessage.DeletedIdDuplicated);
        }

        if (!distinctIds.Any())
        {
            throw new BadRequestException(CustomResponseMessage.DeletedIdsEmpty);
        }

        var factorsToDelete = await _departmentRepo.GetAllAsync(
            predicate: x => distinctIds.Contains(x.Id),
            disableTracking: true);

        if (factorsToDelete == null || !factorsToDelete.Any())
        {
            throw new NotFoundException(CustomResponseMessage.EntityNotFound);
        }

        if (factorsToDelete.Count != distinctIds.Count)
        {
            throw new NotFoundException(CustomResponseMessage.EntityNotFound);
        }

        _departmentRepo.Delete(factorsToDelete);
        await unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<List<DepartmentDto>> GetAllAsync(string? search)
    {
        search = search ?? string.Empty;
        var list = await _departmentRepo.GetAllAsync(
            predicate: x => x.Name.Contains(search) || x.Code.Contains(search),
            disableTracking: true);

        return list.Adapt<List<DepartmentDto>>();
    }

    public async Task<DepartmentDto> GetByIdAsync(Guid id)
    {
        var department = await _departmentRepo.GetFirstOrDefaultAsync(
            predicate: d => d.Id == id,
            disableTracking: true
            ) ?? throw new NotFoundException("Department is not found");

        return department.Adapt<DepartmentDto>();
    }

    public async Task<bool> UpdateAsync(DepartmentDto updateDepartment)
    {
        var department = await _departmentRepo.GetFirstOrDefaultAsync(
            predicate: d => d.Id == updateDepartment.Id,
            disableTracking: false
            ) ?? throw new NotFoundException("Department is not found");

        updateDepartment.Adapt(department);
        await unitOfWork.SaveChangesAsync();
        return true;
    }
}
