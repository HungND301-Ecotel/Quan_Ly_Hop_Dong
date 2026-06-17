using Application.Common.Exceptions;
using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using Application.Dto.Catalog;
using Mapster;
using MediatR;

namespace Application.Catalog.ContractAppendix.Queries;

public record class GetContractAppendixByIdQuery(Guid Id) : IRequest<ContractAppendixDto>;

public class GetContractAppendixByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetContractAppendixByIdQuery, ContractAppendixDto>
{
    private readonly IWriteRepository<Domain.Entities.Category.ContractAppendix> _repo = unitOfWork.GetRepository<Domain.Entities.Category.ContractAppendix>();
    public async Task<ContractAppendixDto> Handle(GetContractAppendixByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _repo.GetFirstOrDefaultAsync(predicate: c => c.Id == request.Id) ?? throw new BadRequestException("Invalid Id");
        return entity.Adapt<ContractAppendixDto>();
    }
}
