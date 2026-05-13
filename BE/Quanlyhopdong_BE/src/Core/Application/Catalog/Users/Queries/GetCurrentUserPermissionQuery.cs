using Application.Common.Interfaces;
using Application.Dto.Catalog;
using Application.Interfaces.Services;
using MediatR;

namespace Application.Catalog.Users.Queries;

public record class GetCurrentUserPermissionQuery() : IRequest<UserPermissionsDto>;

public class GetCurrentUserPermissionQueryHandler(IUserService _userService, ICurrentUser currentUser) : IRequestHandler<GetCurrentUserPermissionQuery, UserPermissionsDto>
{
    public async Task<UserPermissionsDto> Handle(GetCurrentUserPermissionQuery request, CancellationToken cancellationToken)
    {
        return await _userService.GetUserPermissionsAsync(currentUser.UserId);
    }
}