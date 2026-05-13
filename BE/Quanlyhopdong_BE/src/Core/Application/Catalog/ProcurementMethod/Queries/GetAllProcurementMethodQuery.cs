using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using Application.Dto.Catalog;
using Mapster;
using MediatR;

namespace Application.Catalog.ProcurementMethod.Queries;

public record class GetAllProcurementMethodQuery() : IRequest<IList<ProcurementMethodDto>>;

public class GetAllProcurementMethodQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetAllProcurementMethodQuery, IList<ProcurementMethodDto>>
{
    private readonly IWriteRepository<Domain.Entities.Category.ProcurementMethod> _procumentMethodRepo = unitOfWork.GetRepository<Domain.Entities.Category.ProcurementMethod>();
    public async Task<IList<ProcurementMethodDto>> Handle(GetAllProcurementMethodQuery request, CancellationToken cancellationToken)
    {
        var result = await _procumentMethodRepo.GetAllAsync(disableTracking: true);
        return result.Adapt<List<ProcurementMethodDto>>();
    }
}
