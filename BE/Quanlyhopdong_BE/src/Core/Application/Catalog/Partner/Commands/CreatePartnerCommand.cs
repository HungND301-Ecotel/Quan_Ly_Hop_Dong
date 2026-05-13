using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.Partner.Commands;

public record class CreatePartnerCommand(CreatePartnerDto CreateModel) : IRequest<bool>;

public class CreatePartnerCommandHandler(IPartnerService partnerService) : IRequestHandler<CreatePartnerCommand, bool>
{
    public async Task<bool> Handle(CreatePartnerCommand request, CancellationToken cancellationToken)
    {
        return await partnerService.CreateAsync(request.CreateModel);
    }
}