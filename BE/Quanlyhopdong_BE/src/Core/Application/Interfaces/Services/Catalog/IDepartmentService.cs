using Application.Dto.Catalog;

namespace Application.Interfaces.Services.Catalog;

public interface IDepartmentService
{
    Task<List<DepartmentDto>> GetAllAsync(string? search);
    Task<DepartmentDto> GetByIdAsync(Guid id);
    Task<bool> CreateAsync(CreateDepartmentDto dto);
    public Task<bool> UpdateAsync(DepartmentDto updateDepartment);
    Task<bool> DeleteAsync(Guid id);
    public Task<bool> DeleteAsync(IList<Guid> deleteIds);
}
