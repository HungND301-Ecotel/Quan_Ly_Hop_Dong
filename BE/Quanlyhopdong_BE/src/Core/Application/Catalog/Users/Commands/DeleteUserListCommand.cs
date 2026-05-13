using Application.Interfaces.Services;
using MediatR;

namespace Application.Catalog.Users.Commands;

public record class DeleteUserListCommand(IList<Guid> UserIds) : IRequest<bool>;
public class DeleteUserListCommandHandler(IUserService userService) : IRequestHandler<DeleteUserListCommand, bool>
{
    public async Task<bool> Handle(DeleteUserListCommand request, CancellationToken cancellationToken)
    {
        return await userService.DeleteUserListAsync(request.UserIds);
    }
}