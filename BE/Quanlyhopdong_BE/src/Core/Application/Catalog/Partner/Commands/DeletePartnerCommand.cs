using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.Partner.Commands;

public record class DeletePartnerCommand(IList<Guid> DeleteIds) : IRequest<bool>;

public class DeletePartnerCommandHandler(IPartnerService partnerService) : IRequestHandler<DeletePartnerCommand, bool>
{
    public async Task<bool> Handle(DeletePartnerCommand request, CancellationToken cancellationToken)
    {
        return await partnerService.DeleteAsync(request.DeleteIds);
    }
}