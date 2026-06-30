using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using Application.Interfaces.Services;
using MediatR;

namespace Application.Catalog.Users.Commands;

public record class ResetUserPasswordCommand(Guid UserId) : IRequest<bool>;

public class ResetUserPasswordCommandHandler(
    IUserService userService,
    ICurrentUser currentUser,
    IUnitOfWork unitOfWork) : IRequestHandler<ResetUserPasswordCommand, bool>
{
    private readonly IWriteRepository<Domain.Entities.Identity.User> _userRepository = unitOfWork.GetRepository<Domain.Entities.Identity.User>();

    public async Task<bool> Handle(ResetUserPasswordCommand request, CancellationToken cancellationToken)
    {
        var actingUserId = currentUser.UserId;
        var actingUser = await _userRepository.GetFirstOrDefaultAsync(
            predicate: u => u.Id == actingUserId,
            disableTracking: true);

        if (actingUser == null || actingUser.Role != Domain.Common.Enums.UserRole.Admin)
        {
            throw new ForbiddenException("Chỉ Admin mới có quyền reset mật khẩu.");
        }

        await userService.ChangePasswordAsync(request.UserId, "123456");
        return true;
    }
}
