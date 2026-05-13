using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.SignedContents.Commands;

public record DeleteSignedContentCommand(IList<Guid> DeleteIds) : IRequest<bool>;

public class DeleteSignedContentCommandHandler(ISignedContentService signedContentService) : IRequestHandler<DeleteSignedContentCommand, bool>
{
    public async Task<bool> Handle(DeleteSignedContentCommand request, CancellationToken cancellationToken)
    {
        return await signedContentService.DeleteAsync(request.DeleteIds);
    }
}
