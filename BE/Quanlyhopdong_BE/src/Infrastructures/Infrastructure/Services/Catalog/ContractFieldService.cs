using Application.Common.Exceptions;
using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using Domain.Entities.Category;
using Mapster;
using Shared.Constants;

namespace Infrastructure.Services.Catalog;

public class ContractFieldService(IUnitOfWork unitOfWork) : IContractFieldService
{
    private readonly IWriteRepository<ContractField> _contractFieldRepo = unitOfWork.GetRepository<ContractField>();

    public async Task<bool> CreateContractField(CreateContractFieldDto createModel)
    {
        var isDuplicateCode = await _contractFieldRepo.AnyAsync(x => x.Code.ToLower() == createModel.Code.Trim().ToLower());
        if (isDuplicateCode)
        {
            throw new BadRequestException("Code already exists");
        }

        var entity = ContractField.Create(createModel.Name, createModel.Code, createModel.Description);
        await _contractFieldRepo.InsertAsync(entity);
        await unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteContractFieldList(IList<DefaultIdType> deleteIds)
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

        var itemsToDelete = await _contractFieldRepo.GetAllAsync(
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
            _contractFieldRepo.Delete(itemsToDelete);
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

    public async Task<List<ContractFieldDto>> GetAllContractFieldAsync()
    {
        var list = await _contractFieldRepo.GetAllAsync(disableTracking: true);
        return list.Adapt<List<ContractFieldDto>>();
    }

    public async Task<ContractFieldDto> GetContractFieldByIdAsync(DefaultIdType id)
    {
        var contractField = await _contractFieldRepo.GetFirstOrDefaultAsync(
            predicate: c => c.Id == id,
            disableTracking: true) ?? throw new BadRequestException("Invalid id");

        return contractField.Adapt<ContractFieldDto>();
    }

    public async Task<bool> UpdateContractField(ContractFieldDto updateModel)
    {
        var contractField = await _contractFieldRepo.GetFirstOrDefaultAsync(
            predicate: c => c.Id == updateModel.Id,
            disableTracking: false) ?? throw new BadRequestException("Invalid id");

        var isDuplicateCode = await _contractFieldRepo.AnyAsync(x => x.Code.ToLower() == updateModel.Code.Trim().ToLower() && x.Id != updateModel.Id);
        if (isDuplicateCode)
        {
            throw new BadRequestException("Code already exists");
        }

        contractField.Update(updateModel.Name, updateModel.Code, updateModel.Description);
        await unitOfWork.SaveChangesAsync();
        return true;
    }
}
