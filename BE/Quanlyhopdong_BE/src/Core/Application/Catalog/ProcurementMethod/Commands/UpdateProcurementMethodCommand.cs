using Application.Common.Exceptions;
using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using Application.Dto.Catalog;
using MediatR;

namespace Application.Catalog.ProcurementMethod.Commands;

public record class UpdateProcurementMethodCommand(ProcurementMethodDto UpdateModel) : IRequest<bool>;

public class UpdateProcurementMethodCommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<UpdateProcurementMethodCommand, bool>
{
    private readonly IWriteRepository<Domain.Entities.Category.ProcurementMethod> repo = _unitOfWork.GetRepository<Domain.Entities.Category.ProcurementMethod>();
    public async Task<bool> Handle(UpdateProcurementMethodCommand request, CancellationToken cancellationToken)
    {
        if (await repo.AnyAsync(r => r.Code == request.UpdateModel.Code && r.Id != request.UpdateModel.Id))
        {
            throw new BadRequestException("Code is already existed");
        }

        var entity = await repo.GetFirstOrDefaultAsync(predicate: p => p.Id == request.UpdateModel.Id, disableTracking: false) ?? throw new BadRequestException("Invalid Id");
        entity.Update(request.UpdateModel.Code, request.UpdateModel.Name, request.UpdateModel.Description);
        await _unitOfWork.SaveChangesAsync();
        return true;
    }
}