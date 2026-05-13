using Application.Dto.Catalog;

namespace Application.Interfaces.Services.Catalog;

public interface IContractTypeService
{
    Task<List<ContractTypeDto>> GetAllContractTypeAsync();
    Task<ContractTypeDto> GetContractTypeByIdAsync(Guid id);
    Task<bool> CreateContractType(CreateContractTypeDto createModel);
    Task<bool> UpdateContractType(ContractTypeDto updateModel);
    Task<bool> DeleteContractTypeList(IList<Guid> deleteIds);
}
