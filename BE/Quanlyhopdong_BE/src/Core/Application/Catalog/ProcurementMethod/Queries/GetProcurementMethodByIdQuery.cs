using Application.Common.Exceptions;
using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using Application.Dto.Catalog;
using Mapster;
using MediatR;

namespace Application.Catalog.ProcurementMethod.Queries;

public record class GetProcurementMethodByIdQuery(Guid Id) : IRequest<ProcurementMethodDto>;

public class GetProcurementMethodByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetProcurementMethodByIdQuery, ProcurementMethodDto>
{
    private readonly IWriteRepository<Domain.Entities.Category.ProcurementMethod> _procumentMethodRepo = unitOfWork.GetRepository<Domain.Entities.Category.ProcurementMethod>();
    public async Task<ProcurementMethodDto> Handle(GetProcurementMethodByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _procumentMethodRepo.GetFirstOrDefaultAsync(predicate: c => c.Id == request.Id) ?? throw new BadRequestException("Invalid Id");
        return entity.Adapt<ProcurementMethodDto>();
    }
}