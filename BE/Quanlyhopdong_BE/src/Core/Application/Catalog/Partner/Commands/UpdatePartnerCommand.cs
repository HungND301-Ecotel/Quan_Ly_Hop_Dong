using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.Partner.Commands;

public record class UpdatePartnerCommand(PartnerDto UpdateModel) : IRequest<bool>;

public class UpdatePartnerCommandHandler(IPartnerService partnerService) : IRequestHandler<UpdatePartnerCommand, bool>
{
    public async Task<bool> Handle(UpdatePartnerCommand request, CancellationToken cancellationToken)
    {
        return await partnerService.UpdateAsync(request.UpdateModel);
    }
}