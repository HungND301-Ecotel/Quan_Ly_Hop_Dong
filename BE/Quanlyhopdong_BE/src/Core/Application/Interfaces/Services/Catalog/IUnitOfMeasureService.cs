using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Dto.Catalog;

namespace Application.Interfaces.Services.Catalog;

public interface IUnitOfMeasureService
{
    Task<IList<UnitOfMeasureDto>> GetAllAsync(string? search);
    Task<UnitOfMeasureDto?> GetByIdAsync(Guid id);
    Task<Guid> CreateAsync(string code, string name);
    Task<bool> UpdateAsync(Guid id, string code, string name, bool isActive);
    Task<bool> DeleteAsync(Guid id);
}
