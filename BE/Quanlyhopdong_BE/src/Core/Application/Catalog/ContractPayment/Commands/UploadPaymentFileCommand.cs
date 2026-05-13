using Application.Common.Exceptions;
using Application.Dto.Catalog.ContractPayment;
using Application.Interfaces.Services.Catalog;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace Application.Catalog.ContractPayment.Commands;

public record UploadPaymentFileCommand(IFormFile File, UploadPaymentFileRequest Request)
    : IRequest<UploadPaymentFileResponse>;

public class UploadPaymentFileCommandHandler(IContractPaymentService contractPaymentService)
    : IRequestHandler<UploadPaymentFileCommand, UploadPaymentFileResponse>
{
    public async Task<UploadPaymentFileResponse> Handle(
        UploadPaymentFileCommand request,
        CancellationToken cancellationToken)
    {
        if (request.File == null || request.File.Length == 0)
        {
            throw new BadRequestException("File is required");
        }

        if (request.Request.ContractId == Guid.Empty)
        {
            throw new BadRequestException("Contract ID is required");
        }

        return await contractPaymentService.UploadFileAsync(request.File, request.Request);
    }
}
