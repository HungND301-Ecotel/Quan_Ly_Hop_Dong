using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.SignedContents.Queries;

public record GetSignedContentsByLevel3CodeIdQuery(Guid Level3CodeId) : IRequest<IList<SignedContentLookupDto>>;

public class GetSignedContentsByLevel3CodeIdQueryHandler(ISignedContentService signedContentService)
    : IRequestHandler<GetSignedContentsByLevel3CodeIdQuery, IList<SignedContentLookupDto>>
{
    public async Task<IList<SignedContentLookupDto>> Handle(GetSignedContentsByLevel3CodeIdQuery request, CancellationToken cancellationToken)
    {
        return await signedContentService.GetByLevel3CodeIdAsync(request.Level3CodeId);
    }
}
