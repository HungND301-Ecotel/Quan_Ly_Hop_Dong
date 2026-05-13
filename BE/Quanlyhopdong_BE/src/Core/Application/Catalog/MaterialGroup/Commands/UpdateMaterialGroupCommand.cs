using Application.Common.Exceptions;
using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using Application.Dto.Catalog;
using MediatR;

namespace Application.Catalog.MaterialGroup.Commands;

public record class UpdateMaterialGroupCommand(MaterialGroupDto UpdateModel) : IRequest<bool>;

public class UpdateMaterialGroupCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateMaterialGroupCommand, bool>
{
    private readonly IWriteRepository<Domain.Entities.Category.MaterialGroup> _repo = unitOfWork.GetRepository<Domain.Entities.Category.MaterialGroup>();

    public async Task<bool> Handle(UpdateMaterialGroupCommand request, CancellationToken cancellationToken)
    {
        if (await _repo.AnyAsync(r => r.GroupCode == request.UpdateModel.GroupCode && r.Id != request.UpdateModel.Id))
        {
            throw new BadRequestException("GroupCode is already existed");
        }

        var entity = await _repo.GetFirstOrDefaultAsync(predicate: p => p.Id == request.UpdateModel.Id) ?? throw new BadRequestException("Invalid Id");
        entity.Update(request.UpdateModel.GroupCode, request.UpdateModel.Name);
        _repo.Update(entity);
        await unitOfWork.SaveChangesAsync();
        return true;
    }
}
