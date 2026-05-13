using Application.Common.Exceptions;
using Application.Dto.Catalog.ContractPayment;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.ContractPayment.Commands;

public record UpdateContractPaymentBatchCommand(UpdateContractPaymentBatchRequest Request)
    : IRequest<UpdateContractPaymentBatchResponse>;

public class UpdateContractPaymentBatchCommandHandler(IContractPaymentService contractPaymentService)
    : IRequestHandler<UpdateContractPaymentBatchCommand, UpdateContractPaymentBatchResponse>
{
    public async Task<UpdateContractPaymentBatchResponse> Handle(
        UpdateContractPaymentBatchCommand request,
        CancellationToken cancellationToken)
    {
        if (request.Request.ContractId == Guid.Empty)
        {
            throw new BadRequestException("Contract ID is required");
        }

        if (request.Request.Items == null)
        {
            throw new BadRequestException("Items list cannot be null");
        }

        return await contractPaymentService.UpdateBatchAsync(request.Request);
    }
}
