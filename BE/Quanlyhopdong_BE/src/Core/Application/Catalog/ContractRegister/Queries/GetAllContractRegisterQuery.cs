using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using Application.Dto.Catalog;
using Mapster;
using MediatR;

namespace Application.Catalog.ContractRegister.Queries;

public record class GetAllContractRegisterQuery() : IRequest<IList<ContractRegisterDto>>;

public class GetAllContractRegisterQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetAllContractRegisterQuery, IList<ContractRegisterDto>>
{
    private readonly IWriteRepository<Domain.Entities.Category.ContractRegister> _contractRegisterRepo = unitOfWork.GetRepository<Domain.Entities.Category.ContractRegister>();
    public async Task<IList<ContractRegisterDto>> Handle(GetAllContractRegisterQuery request, CancellationToken cancellationToken)
    {
        var result = await _contractRegisterRepo.GetAllAsync(disableTracking: true);
        return result.Adapt<List<ContractRegisterDto>>();
    }
}