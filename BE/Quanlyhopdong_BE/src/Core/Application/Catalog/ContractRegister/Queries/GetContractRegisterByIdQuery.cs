using Application.Common.Exceptions;
using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using Application.Dto.Catalog;
using Mapster;
using MediatR;

namespace Application.Catalog.ContractRegister.Queries;

public record class GetContractRegisterByIdQuery(Guid Id) : IRequest<ContractRegisterDto>;

public class GetContractRegisterByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetContractRegisterByIdQuery, ContractRegisterDto>
{
    private readonly IWriteRepository<Domain.Entities.Category.ContractRegister> _contractRegisterRepo = unitOfWork.GetRepository<Domain.Entities.Category.ContractRegister>();
    public async Task<ContractRegisterDto> Handle(GetContractRegisterByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _contractRegisterRepo.GetFirstOrDefaultAsync(predicate: c => c.Id == request.Id) ?? throw new BadRequestException("Invalid Id");
        return entity.Adapt<ContractRegisterDto>();
    }
}