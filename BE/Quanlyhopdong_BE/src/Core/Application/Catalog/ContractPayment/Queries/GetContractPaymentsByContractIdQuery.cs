using Application.Common.Exceptions;
using Application.Dto.Catalog.ContractPayment;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.ContractPayment.Queries;

public record GetContractPaymentsByContractIdQuery(Guid ContractId) : IRequest<ContractPaymentResponseDto>;

public class GetContractPaymentsByContractIdQueryHandler(IContractPaymentService contractPaymentService)
    : IRequestHandler<GetContractPaymentsByContractIdQuery, ContractPaymentResponseDto>
{
    public async Task<ContractPaymentResponseDto> Handle(
        GetContractPaymentsByContractIdQuery request,
        CancellationToken cancellationToken)
    {
        if (request.ContractId == Guid.Empty)
        {
            throw new BadRequestException("Contract ID is required");
        }

        return await contractPaymentService.GetByContractIdAsync(request.ContractId);
    }
}
