using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using Application.Dto.Catalog;
using Mapster;
using MediatR;

namespace Application.Catalog.ContractAppendix.Queries;

public record class GetAllContractAppendixQuery() : IRequest<IList<ContractAppendixDto>>;

public class GetAllContractAppendixQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetAllContractAppendixQuery, IList<ContractAppendixDto>>
{
    private readonly IWriteRepository<Domain.Entities.Category.ContractAppendix> _repo = unitOfWork.GetRepository<Domain.Entities.Category.ContractAppendix>();
    public async Task<IList<ContractAppendixDto>> Handle(GetAllContractAppendixQuery request, CancellationToken cancellationToken)
    {
        var result = await _repo.GetAllAsync(disableTracking: true);
        return result.Adapt<List<ContractAppendixDto>>();
    }
}
