using Application.Common.Exceptions;
using Application.Dto.Catalog.ContractProgress;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.ContractProgress.Queries;

public record GetContractProgressByIdQuery(Guid Id) : IRequest<ContractProgressDto>;

public class GetContractProgressByIdQueryHandler(IContractProgressService contractProgressService)
    : IRequestHandler<GetContractProgressByIdQuery, ContractProgressDto>
{
    public async Task<ContractProgressDto> Handle(
        GetContractProgressByIdQuery request,
        CancellationToken cancellationToken)
    {
        if (request.Id == Guid.Empty)
        {
            throw new BadRequestException("ContractProgress ID is required");
        }

        return await contractProgressService.GetByIdAsync(request.Id);
    }
}
