using Application.Dto.Catalog;

namespace Application.Interfaces.Services.Catalog;

public interface IPartnerService
{
    Task<List<PartnerDto>> GetAllAsync(string? search);
    Task<PartnerDto> GetByIdAsync(Guid id);
    Task<bool> CreateAsync(CreatePartnerDto dto);
    Task<bool> UpdateAsync(PartnerDto dto);
    Task<bool> DeleteAsync(IList<Guid> deleteIds);
}
