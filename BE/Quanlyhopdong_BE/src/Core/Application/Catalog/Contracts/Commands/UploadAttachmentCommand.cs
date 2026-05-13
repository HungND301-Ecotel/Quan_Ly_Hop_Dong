using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace Application.Catalog.Contracts.Commands;

public record class UploadAttachmentCommand(List<IFormFile> AttachmentFiles, string ContractNumber) : IRequest<IList<CreateContractAttachmentDto>>;

public class UploadAttachmentCommandHandler(IContractService _contractService) : IRequestHandler<UploadAttachmentCommand, IList<CreateContractAttachmentDto>>
{
    public async Task<IList<CreateContractAttachmentDto>> Handle(UploadAttachmentCommand request, CancellationToken cancellationToken)
    {
        return await _contractService.UploadAttachmentFile(request.AttachmentFiles, request.ContractNumber);
    }
}