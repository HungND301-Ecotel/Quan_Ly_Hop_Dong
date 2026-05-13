using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using Application.Dto.Catalog;
using Mapster;
using MediatR;

namespace Application.Catalog.Position.Queries;

public record class GetAllPositionQuery() : IRequest<IList<PositionDto>>;

public class GetAllPositionQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetAllPositionQuery, IList<PositionDto>>
{
    private readonly IWriteRepository<Domain.Entities.Identity.Position> _postionRepo = unitOfWork.GetRepository<Domain.Entities.Identity.Position>();
    public async Task<IList<PositionDto>> Handle(GetAllPositionQuery request, CancellationToken cancellationToken)
    {
        var result = await _postionRepo.GetAllAsync(disableTracking: true);
        return result.Adapt<List<PositionDto>>();
    }
}