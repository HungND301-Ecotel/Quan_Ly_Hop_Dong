using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.SignedContents.Queries;

public record GetAllSignedContentQuery(string? Search) : IRequest<IList<SignedContentDto>>;

public class GetAllSignedContentQueryHandler(ISignedContentService signedContentService) : IRequestHandler<GetAllSignedContentQuery, IList<SignedContentDto>>
{
    public async Task<IList<SignedContentDto>> Handle(GetAllSignedContentQuery request, CancellationToken cancellationToken)
    {
        return await signedContentService.GetAllAsync(request.Search);
    }
}
