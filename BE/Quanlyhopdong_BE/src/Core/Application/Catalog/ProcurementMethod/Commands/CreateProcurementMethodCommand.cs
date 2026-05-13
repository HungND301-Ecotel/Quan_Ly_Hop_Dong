using Application.Common.Exceptions;
using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using Application.Dto.Catalog;
using Mapster;
using MediatR;

namespace Application.Catalog.ProcurementMethod.Commands;

public record class CreateProcurementMethodCommand(CreateProcurementMethodDto CreateModel) : IRequest<bool>;

public class CreateProcurementMethodCommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<CreateProcurementMethodCommand, bool>
{
    private readonly IWriteRepository<Domain.Entities.Category.ProcurementMethod> repo = _unitOfWork.GetRepository<Domain.Entities.Category.ProcurementMethod>();
    public async Task<bool> Handle(CreateProcurementMethodCommand request, CancellationToken cancellationToken)
    {
        if (await repo.AnyAsync(r => r.Code == request.CreateModel.Code))
        {
            throw new BadRequestException("Code is already existed");
        }

        await repo.InsertAsync(request.CreateModel.Adapt<Domain.Entities.Category.ProcurementMethod>(), cancellationToken);
        await _unitOfWork.SaveChangesAsync();
        return true;
    }
}