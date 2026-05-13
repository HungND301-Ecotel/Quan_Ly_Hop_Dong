using Application.Interfaces.Services;
using MediatR;

namespace Application.Catalog.Users.Commands;

public record class DeleteSignatureCommand(Guid UserId, Guid SignatureId) : IRequest<bool>;

public class DeleteSignatureCommandHandler(IUserService _userService) : IRequestHandler<DeleteSignatureCommand, bool>
{
    public async Task<bool> Handle(DeleteSignatureCommand request, CancellationToken cancellationToken)
    {
        return await _userService.DeleteUserSignatureAsync(request.UserId, request.SignatureId);
    }
}