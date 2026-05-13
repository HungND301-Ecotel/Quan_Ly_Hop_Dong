using Application.Dto.Catalog;
using Application.Interfaces.Services;
using MediatR;

namespace Application.Catalog.Users.Queries;

public record class GetUserSignaturesQuery(Guid UserId) : IRequest<List<UserSignatureDto>>;

public class GetUserSignaturesQueryHandler(IUserService _userService) : IRequestHandler<GetUserSignaturesQuery, List<UserSignatureDto>>
{
    public async Task<List<UserSignatureDto>> Handle(GetUserSignaturesQuery request, CancellationToken cancellationToken)
    {
        return await _userService.GetUserSignaturesAsync(request.UserId);
    }
}