using Application.Common.Exceptions;
using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using Application.Dto.Catalog;
using Mapster;
using MediatR;

namespace Application.Catalog.ContractNumber.Queries;

public record class GetContractNumberByIdQuery(Guid Id) : IRequest<ContractNumberDto>;

public class GetContractNumberByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetContractNumberByIdQuery, ContractNumberDto>
{
    private readonly IWriteRepository<Domain.Entities.Category.ContractNumber> _repo = unitOfWork.GetRepository<Domain.Entities.Category.ContractNumber>();
    public async Task<ContractNumberDto> Handle(GetContractNumberByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _repo.GetFirstOrDefaultAsync(predicate: c => c.Id == request.Id) ?? throw new BadRequestException("Invalid Id");
        return entity.Adapt<ContractNumberDto>();
    }
}
