using Application.Common.Exceptions;
using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using Application.Dto.Catalog;
using MediatR;

namespace Application.Catalog.Material.Commands;

public record class UpdateMaterialCommand(MaterialDto UpdateModel) : IRequest<bool>;

public class UpdateMaterialCommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<UpdateMaterialCommand, bool>
{
    private readonly IWriteRepository<Domain.Entities.Category.Material> repo = _unitOfWork.GetRepository<Domain.Entities.Category.Material>();
    public async Task<bool> Handle(UpdateMaterialCommand request, CancellationToken cancellationToken)
    {
        var entity = await repo.GetFirstOrDefaultAsync(predicate: p => p.Id == request.UpdateModel.Id) ?? throw new BadRequestException("Invalid Id");
        entity.Update(request.UpdateModel.MaterialCode, request.UpdateModel.Name, request.UpdateModel.UnitOfMeasureId, request.UpdateModel.Price, request.UpdateModel.IsOtherMaterial, "", request.UpdateModel.MaterialGroupId);
        repo.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        return true;
    }
}