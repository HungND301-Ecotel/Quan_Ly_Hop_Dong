using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using Application.Dto.Catalog;
using Mapster;
using MediatR;

namespace Application.Catalog.ContractRegister.Commands;

public record class CreateContractRegisterCommand(CreateContractRegisterDto CreateModel) : IRequest<bool>;

public class CreateContractRegisterCommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<CreateContractRegisterCommand, bool>
{
    private readonly IWriteRepository<Domain.Entities.Category.ContractRegister> repo = _unitOfWork.GetRepository<Domain.Entities.Category.ContractRegister>();
    public async Task<bool> Handle(CreateContractRegisterCommand request, CancellationToken cancellationToken)
    {
        await repo.InsertAsync(request.CreateModel.Adapt<Domain.Entities.Category.ContractRegister>(), cancellationToken);
        await _unitOfWork.SaveChangesAsync();
        return true;
    }
}