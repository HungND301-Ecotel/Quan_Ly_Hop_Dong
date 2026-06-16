using Application.Dto.Catalog;

namespace Application.Interfaces.Services.Catalog;

public interface IContractFieldService
{
    Task<List<ContractFieldDto>> GetAllContractFieldAsync();
    Task<ContractFieldDto> GetContractFieldByIdAsync(Guid id);
    Task<bool> CreateContractField(CreateContractFieldDto createModel);
    Task<bool> UpdateContractField(ContractFieldDto updateModel);
    Task<bool> DeleteContractFieldList(IList<Guid> deleteIds);
}
