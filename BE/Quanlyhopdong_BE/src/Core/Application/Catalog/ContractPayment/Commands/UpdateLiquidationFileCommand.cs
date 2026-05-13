using Application.Common.Exceptions;
using Application.Dto.Catalog.ContractPayment;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.ContractPayment.Commands;

public record UpdateLiquidationFileCommand(UpdateLiquidationFileRequest Request) : IRequest<Unit>;

public class UpdateLiquidationFileCommandHandler(IContractPaymentService contractPaymentService)
    : IRequestHandler<UpdateLiquidationFileCommand, Unit>
{
    public async Task<Unit> Handle(
        UpdateLiquidationFileCommand request,
        CancellationToken cancellationToken)
    {
        if (request.Request.ContractId == Guid.Empty)
        {
            throw new BadRequestException("Contract ID is required");
        }

        if (string.IsNullOrWhiteSpace(request.Request.LiquidationFilePath))
        {
            throw new BadRequestException("Liquidation file path is required");
        }

        await contractPaymentService.UpdateLiquidationFileAsync(request.Request);
        return Unit.Value;
    }
}
