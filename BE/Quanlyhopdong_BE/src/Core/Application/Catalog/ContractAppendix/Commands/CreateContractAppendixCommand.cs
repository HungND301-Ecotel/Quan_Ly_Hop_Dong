using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using Application.Dto.Catalog;
using Mapster;
using MediatR;

namespace Application.Catalog.ContractAppendix.Commands;

public record class CreateContractAppendixCommand(CreateContractAppendixDto CreateModel) : IRequest<bool>;

public class CreateContractAppendixCommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<CreateContractAppendixCommand, bool>
{
    private readonly IWriteRepository<Domain.Entities.Category.ContractAppendix> repo = _unitOfWork.GetRepository<Domain.Entities.Category.ContractAppendix>();
    public async Task<bool> Handle(CreateContractAppendixCommand request, CancellationToken cancellationToken)
    {
        await repo.InsertAsync(request.CreateModel.Adapt<Domain.Entities.Category.ContractAppendix>(), cancellationToken);
        await _unitOfWork.SaveChangesAsync();
        return true;
    }
}
