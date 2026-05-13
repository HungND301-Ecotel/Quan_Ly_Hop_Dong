using Application.Common.Exceptions;
using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using Application.Dto.Catalog;
using Mapster;
using MediatR;

namespace Application.Catalog.MaterialGroup.Commands;

public record class CreateMaterialGroupCommand(CreateMaterialGroupDto CreateModel) : IRequest<bool>;

public class CreateMaterialGroupCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateMaterialGroupCommand, bool>
{
    private readonly IWriteRepository<Domain.Entities.Category.MaterialGroup> _repo = unitOfWork.GetRepository<Domain.Entities.Category.MaterialGroup>();

    public async Task<bool> Handle(CreateMaterialGroupCommand request, CancellationToken cancellationToken)
    {
        if (await _repo.AnyAsync(r => r.GroupCode == request.CreateModel.GroupCode))
        {
            throw new BadRequestException("GroupCode is already existed");
        }

        await _repo.InsertAsync(request.CreateModel.Adapt<Domain.Entities.Category.MaterialGroup>(), cancellationToken);
        await unitOfWork.SaveChangesAsync();
        return true;
    }
}
