using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using Application.Dto.Catalog;
using Mapster;
using MediatR;

namespace Application.Catalog.ContractNumber.Queries;

public record class GetAllContractNumberQuery() : IRequest<IList<ContractNumberDto>>;

public class GetAllContractNumberQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetAllContractNumberQuery, IList<ContractNumberDto>>
{
    private readonly IWriteRepository<Domain.Entities.Category.ContractNumber> _repo = unitOfWork.GetRepository<Domain.Entities.Category.ContractNumber>();
    public async Task<IList<ContractNumberDto>> Handle(GetAllContractNumberQuery request, CancellationToken cancellationToken)
    {
        var result = await _repo.GetAllAsync(disableTracking: true);
        return result.Adapt<List<ContractNumberDto>>();
    }
}
