using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using Domain.Entities.Category;
using Mapster;
using Shared.Constants;

namespace Infrastructure.Services.Catalog;

public class PartnerService(IUnitOfWork unitOfWork, ICurrentUser currentUser) : IPartnerService
{
    private readonly IWriteRepository<Partner> _partnerRepository = unitOfWork.GetRepository<Partner>();

    public async Task<bool> CreateAsync(CreatePartnerDto dto)
    {
        if (await _partnerRepository.AnyAsync(x => x.TaxCode == dto.TaxCode))
        {
            throw new ConflictException(("Taxt code already exists"));
        }

        var entity = dto.Adapt<Partner>();
        await _partnerRepository.InsertAsync(entity);
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

        var factorsToDelete = await _partnerRepository.GetAllAsync(
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

        _partnerRepository.Delete(factorsToDelete);
        await unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<List<PartnerDto>> GetAllAsync(string? search)
    {
        search = search ?? string.Empty;
        var list = await _partnerRepository.GetAllAsync(
            predicate: x => x.Name.Contains(search) || x.TaxCode.Contains(search),
            disableTracking: true);

        return list.Adapt<List<PartnerDto>>();
    }

    public async Task<PartnerDto> GetByIdAsync(int id)
    {
        var entity = await _partnerRepository.FindAsync(id);
        return entity.Adapt<PartnerDto>();
    }

    public async Task<PartnerDto> GetByIdAsync(DefaultIdType id)
    {
        var department = await _partnerRepository.GetFirstOrDefaultAsync(
            predicate: d => d.Id == id,
            disableTracking: true
            ) ?? throw new NotFoundException("Partner is not found");

        return department.Adapt<PartnerDto>();
    }

    public async Task<bool> UpdateAsync(PartnerDto dto)
    {
        var partner = await _partnerRepository.GetFirstOrDefaultAsync(
            predicate: d => d.Id == dto.Id,
            disableTracking: true
            ) ?? throw new NotFoundException("Partner is not found");

        _partnerRepository.Update(dto.Adapt<Partner>());
        await unitOfWork.SaveChangesAsync();
        return true;
    }
}
