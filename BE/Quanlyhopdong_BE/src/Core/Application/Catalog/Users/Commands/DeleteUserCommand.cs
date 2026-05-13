using Application.Interfaces.Services;
using MediatR;

namespace Application.Catalog.Users.Commands;

public record class DeleteUserCommand(Guid UserId) : IRequest<bool>;
public class DeleteUserCommandHandler(IUserService userService) : IRequestHandler<DeleteUserCommand, bool>
{
    public async Task<bool> Handle(DeleteUserCommand request, CancellationToken cancellationToken)
    {
        return await userService.DeleteUserAsync(request.UserId);
    }
}