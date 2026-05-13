using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.SignedContents.Queries;

public record GetSignedContentByIdQuery(Guid Id) : IRequest<SignedContentDto?>;

public class GetSignedContentByIdQueryHandler(ISignedContentService signedContentService) : IRequestHandler<GetSignedContentByIdQuery, SignedContentDto?>
{
    public async Task<SignedContentDto?> Handle(GetSignedContentByIdQuery request, CancellationToken cancellationToken)
    {
        return await signedContentService.GetByIdAsync(request.Id);
    }
}
