using Application.Dto.Catalog;
using Application.Interfaces.Services;
using MediatR;

namespace Application.Catalog.Users.Commands;

public record class CreateUserSignatureCommand(Guid Id, CreateUserSignatureDto UserSignatureDto) : IRequest<UserSignatureDto>;

public class CreateUserSignatureCommandHandler(IUserService _userService) : IRequestHandler<CreateUserSignatureCommand, UserSignatureDto>
{
    public async Task<UserSignatureDto> Handle(CreateUserSignatureCommand request, CancellationToken cancellationToken)
    {
        return await _userService.CreateUserSignatureAsync(request.Id, request.UserSignatureDto);
    }
}