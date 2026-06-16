using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using Application.Dto.Catalog;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Catalog.Material.Queries;

public record class GetAllMaterialQuery(bool IsOtherMaterial = false) : IRequest<IList<MaterialDto>>;

public class GetAllMaterialQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetAllMaterialQuery, IList<MaterialDto>>
{
    private readonly IWriteRepository<Domain.Entities.Category.Material> _materialRepo = unitOfWork.GetRepository<Domain.Entities.Category.Material>();
    public async Task<IList<MaterialDto>> Handle(GetAllMaterialQuery request, CancellationToken cancellationToken)
    {
        var result = await _materialRepo.GetAllAsync(
            selector: m => new MaterialDto
            {
                Id = m.Id,
                IsOtherMaterial = m.IsOtherMaterial,
                MaterialCode = m.MaterialCode,
                Name = m.Name,
                MaterialGroupId = m.MaterialGroupId,
                MaterialGroupName = m.MaterialGroup != null ? m.MaterialGroup.Name : null,
                UnitOfMeasureId = m.UnitOfMeasureId,
                UnitOfMeasureName = m.UnitOfMeasure != null ? m.UnitOfMeasure.Name : string.Empty,
                Price = m.Price
            },
            predicate: m => m.IsOtherMaterial == request.IsOtherMaterial,
            include: q => q.Include(x => x.UnitOfMeasure).Include(x => x.MaterialGroup),
            disableTracking: true);
        return result;
    }
}