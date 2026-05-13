using Application.Dto.Persistence.Catalog.User;
using Application.Interfaces.Services;
using MediatR;

namespace Application.Catalog.Users.Commands;

public record class CreateNewAccountCommand(CreateNewAccountInput Account) : IRequest<bool>;

public class CreateNewAccountCommandHandler(IUserService _userService) : IRequestHandler<CreateNewAccountCommand, bool>
{
    public async Task<bool> Handle(CreateNewAccountCommand request, CancellationToken cancellationToken)
    {
        return await _userService.CreateNewAccountAsync(request.Account);
    }
}

