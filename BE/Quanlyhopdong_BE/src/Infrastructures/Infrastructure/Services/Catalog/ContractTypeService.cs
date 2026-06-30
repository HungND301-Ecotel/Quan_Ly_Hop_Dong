using Application.Common.Exceptions;
using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using Domain.Entities.Category;
using Mapster;
using Shared.Constants;

namespace Infrastructure.Services.Catalog;

public class ContractTypeService(IUnitOfWork unitOfWork) : IContractTypeService
{
    private readonly IWriteRepository<ContractType> _contractTypeRepo = unitOfWork.GetRepository<ContractType>();
    public async Task<bool> CreateContractType(CreateContractTypeDto createModel)
    {
        var checkExistedCode = await _contractTypeRepo.AnyAsync(c => c.Code == createModel.Code);
        if (checkExistedCode)
        {
            throw new BadRequestException("Code already exited");
        }

        await _contractTypeRepo.InsertAsync(createModel.Adapt<ContractType>());
        await unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteContractTypeList(IList<DefaultIdType> deleteIds)
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

        var itemsToDelete = await _contractTypeRepo.GetAllAsync(
            predicate: x => distinctIds.Contains(x.Id),
            disableTracking: true);

        if (itemsToDelete == null || !itemsToDelete.Any())
        {
            throw new NotFoundException(CustomResponseMessage.EntityNotFound);
        }

        if (itemsToDelete.Count != distinctIds.Count)
        {
            throw new NotFoundException(CustomResponseMessage.EntityNotFound);
        }

        await unitOfWork.BeginTransactionAsync();

        try
        {
            _contractTypeRepo.Delete(itemsToDelete);
            await unitOfWork.SaveChangesAsync();
            await unitOfWork.CommitAsync();

            return true;
        }
        catch (Exception)
        {
            await unitOfWork.RollbackAsync();
            throw;
        }
    }

    public async Task<List<ContractTypeDto>> GetAllContractTypeAsync()
    {
        var list = await _contractTypeRepo.GetAllAsync(disableTracking: true);
        return list.Adapt<List<ContractTypeDto>>();
    }

    public async Task<ContractTypeDto> GetContractTypeByIdAsync(DefaultIdType id)
    {
        var contractType = await _contractTypeRepo.GetFirstOrDefaultAsync(
            predicate: c => c.Id == id,
            disableTracking: true) ?? throw new BadRequestException("Invalid id");

        return contractType.Adapt<ContractTypeDto>();
    }

    public async Task<bool> UpdateContractType(ContractTypeDto updateModel)
    {
        var contractType = await _contractTypeRepo.GetFirstOrDefaultAsync(
            predicate: c => c.Id == updateModel.Id,
            disableTracking: true) ?? throw new BadRequestException("Invalid id");

        contractType.Update(updateModel.Name, updateModel.Code, updateModel.Description);
        _contractTypeRepo.Update(contractType);
        await unitOfWork.SaveChangesAsync();
        return true;
    }
}
