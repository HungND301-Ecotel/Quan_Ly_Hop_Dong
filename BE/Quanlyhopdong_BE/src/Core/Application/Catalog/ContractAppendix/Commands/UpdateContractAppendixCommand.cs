using Application.Common.Exceptions;
using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using Application.Dto.Catalog;
using MediatR;

namespace Application.Catalog.ContractAppendix.Commands;

public record class UpdateContractAppendixCommand(ContractAppendixDto CreateModel) : IRequest<bool>;

public class UpdateContractAppendixCommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<UpdateContractAppendixCommand, bool>
{
    private readonly IWriteRepository<Domain.Entities.Category.ContractAppendix> repo = _unitOfWork.GetRepository<Domain.Entities.Category.ContractAppendix>();
    public async Task<bool> Handle(UpdateContractAppendixCommand request, CancellationToken cancellationToken)
    {
        var entity = await repo.GetFirstOrDefaultAsync(predicate: p => p.Id == request.CreateModel.Id) ?? throw new BadRequestException("Invalid Id");
        entity.Update(request.CreateModel.AppendixNumber, request.CreateModel.ContractNumberId, request.CreateModel.Description);
        repo.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        return true;
    }
}
