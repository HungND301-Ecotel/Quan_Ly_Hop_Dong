using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using Application.Dto.Catalog;
using MediatR;

namespace Application.Catalog.Material.Commands;

public record class CreateMaterialCommand(CreateMaterialDto CreateModel) : IRequest<bool>;

public class CreateMaterialCommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<CreateMaterialCommand, bool>
{
    private readonly IWriteRepository<Domain.Entities.Category.Material> repo = _unitOfWork.GetRepository<Domain.Entities.Category.Material>();
    public async Task<bool> Handle(CreateMaterialCommand request, CancellationToken cancellationToken)
    {
        var dto = request.CreateModel;
        await repo.InsertAsync(Domain.Entities.Category.Material.Create(dto.MaterialCode, dto.Name, dto.UnitOfMeasureId, dto.Price, dto.IsOtherMaterial, dto.Description ?? "", dto.MaterialGroupId, false), cancellationToken);
        await _unitOfWork.SaveChangesAsync();
        return true;
    }
}