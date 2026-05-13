using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.SignedContents.Commands;

public record UpdateSignedContentCommand(Guid Id, string Title, Guid Level3CodeId) : IRequest<bool>;

public class UpdateSignedContentCommandHandler(ISignedContentService signedContentService) : IRequestHandler<UpdateSignedContentCommand, bool>
{
    public async Task<bool> Handle(UpdateSignedContentCommand request, CancellationToken cancellationToken)
    {
        return await signedContentService.UpdateAsync(request.Id, request.Title, request.Level3CodeId);
    }
}
