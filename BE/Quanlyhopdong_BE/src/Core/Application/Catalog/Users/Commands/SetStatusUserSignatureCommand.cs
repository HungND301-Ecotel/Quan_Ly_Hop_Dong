using Application.Interfaces.Services;
using MediatR;

namespace Application.Catalog.Users.Commands;

public record class SetStatusUserSignatureCommand(Guid UserId, Guid SigantureId, bool Status) : IRequest<bool>;

public class SetStatusUserSignatureCommandHandler(IUserService _userService) : IRequestHandler<SetStatusUserSignatureCommand, bool>
{
    public async Task<bool> Handle(SetStatusUserSignatureCommand request, CancellationToken cancellationToken)
    {
        return await _userService.SetStatusUserSignatureAsync(request.UserId, request.SigantureId, request.Status);
    }
}