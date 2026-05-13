using Application.Interfaces.Services;
using MediatR;

namespace Application.Catalog.Users.Commands;

public record class SendUserPasswordAccountEmailCommand(IList<Guid> UserIds) : IRequest<bool>;

public class SendUserPasswordAccountEmailCommandHandler(IUserService _userService) : IRequestHandler<SendUserPasswordAccountEmailCommand, bool>
{
    public async Task<bool> Handle(SendUserPasswordAccountEmailCommand request, CancellationToken cancellationToken)
    {
        return await _userService.SendUserPasswordAccountEmailAsync(request.UserIds);
    }
}