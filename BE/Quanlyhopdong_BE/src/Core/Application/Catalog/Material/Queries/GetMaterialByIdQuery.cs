using Application.Common.Exceptions;
using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using Application.Dto.Catalog;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Catalog.Material.Queries;

public record class GetMaterialByIdQuery(Guid Id) : IRequest<MaterialDto>;

public class GetMaterialByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetMaterialByIdQuery, MaterialDto>
{
    private readonly IWriteRepository<Domain.Entities.Category.Material> _materialRepo = unitOfWork.GetRepository<Domain.Entities.Category.Material>();
    public async Task<MaterialDto> Handle(GetMaterialByIdQuery request, CancellationToken cancellationToken)
    {
        return await _materialRepo.GetFirstOrDefaultAsync(
                   selector: m => new MaterialDto
                   {
                       Id = m.Id,
                       IsOtherMaterial = m.IsOtherMaterial,
                       IsSynced = m.IsSynced,
                       MaterialCode = m.MaterialCode,
                       Name = m.Name,
                       MaterialGroupId = m.MaterialGroupId,
                       MaterialGroupName = m.MaterialGroup != null ? m.MaterialGroup.Name : null,
                       UnitOfMeasureId = m.UnitOfMeasureId,
                       UnitOfMeasureName = m.UnitOfMeasure != null ? m.UnitOfMeasure.Name : string.Empty,
                       Price = m.Price,
                       Description = m.Description
                   },
                   predicate: m => m.Id == request.Id,
                   include: q => q.Include(x => x.UnitOfMeasure).Include(x => x.MaterialGroup),
                   disableTracking: true)
               ?? throw new BadRequestException("Invalid Id");
    }
}