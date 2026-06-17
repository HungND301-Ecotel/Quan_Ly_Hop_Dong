using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using Application.Dto.Catalog;
using Mapster;
using MediatR;

namespace Application.Catalog.ContractNumber.Commands;

public record class CreateContractNumberCommand(CreateContractNumberDto CreateModel) : IRequest<bool>;

public class CreateContractNumberCommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<CreateContractNumberCommand, bool>
{
    private readonly IWriteRepository<Domain.Entities.Category.ContractNumber> repo = _unitOfWork.GetRepository<Domain.Entities.Category.ContractNumber>();
    public async Task<bool> Handle(CreateContractNumberCommand request, CancellationToken cancellationToken)
    {
        await repo.InsertAsync(request.CreateModel.Adapt<Domain.Entities.Category.ContractNumber>(), cancellationToken);
        await _unitOfWork.SaveChangesAsync();
        return true;
    }
}
