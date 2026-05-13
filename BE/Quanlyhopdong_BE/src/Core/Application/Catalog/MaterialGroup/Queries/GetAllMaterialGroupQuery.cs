using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using Application.Dto.Catalog;
using Mapster;
using MediatR;

namespace Application.Catalog.MaterialGroup.Queries;

public record class GetAllMaterialGroupQuery() : IRequest<IList<MaterialGroupDto>>;

public class GetAllMaterialGroupQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetAllMaterialGroupQuery, IList<MaterialGroupDto>>
{
    private readonly IWriteRepository<Domain.Entities.Category.MaterialGroup> _materialGroupRepo = unitOfWork.GetRepository<Domain.Entities.Category.MaterialGroup>();

    public async Task<IList<MaterialGroupDto>> Handle(GetAllMaterialGroupQuery request, CancellationToken cancellationToken)
    {
        var result = await _materialGroupRepo.GetAllAsync(disableTracking: true);
        return result.Adapt<List<MaterialGroupDto>>();
    }
}
