using Application.Common.Exceptions;
using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using Application.Dto.Catalog;
using Mapster;
using MediatR;

namespace Application.Catalog.MaterialGroup.Queries;

public record class GetMaterialGroupByIdQuery(Guid Id) : IRequest<MaterialGroupDto>;

public class GetMaterialGroupByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetMaterialGroupByIdQuery, MaterialGroupDto>
{
    private readonly IWriteRepository<Domain.Entities.Category.MaterialGroup> _materialGroupRepo = unitOfWork.GetRepository<Domain.Entities.Category.MaterialGroup>();

    public async Task<MaterialGroupDto> Handle(GetMaterialGroupByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _materialGroupRepo.GetFirstOrDefaultAsync(predicate: c => c.Id == request.Id) ?? throw new BadRequestException("Invalid Id");
        return entity.Adapt<MaterialGroupDto>();
    }
}
