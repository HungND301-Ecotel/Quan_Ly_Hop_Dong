using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.SignedContents.Commands;

public record CreateSignedContentCommand(string Title, Guid Level3CodeId, string? Description) : IRequest<Guid>;

public class CreateSignedContentCommandHandler(ISignedContentService signedContentService) : IRequestHandler<CreateSignedContentCommand, Guid>
{
    public async Task<Guid> Handle(CreateSignedContentCommand request, CancellationToken cancellationToken)
    {
        return await signedContentService.CreateAsync(request.Title, request.Level3CodeId, request.Description);
    }
}
