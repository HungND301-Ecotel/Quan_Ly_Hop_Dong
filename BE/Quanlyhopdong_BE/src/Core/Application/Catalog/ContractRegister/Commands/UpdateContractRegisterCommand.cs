using Application.Common.Exceptions;
using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using Application.Dto.Catalog;
using MediatR;

namespace Application.Catalog.ContractRegister.Commands;

public record class UpdateContractRegisterCommand(ContractRegisterDto CreateModel) : IRequest<bool>;

public class UpdateContractRegisterCommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<UpdateContractRegisterCommand, bool>
{
    private readonly IWriteRepository<Domain.Entities.Category.ContractRegister> repo = _unitOfWork.GetRepository<Domain.Entities.Category.ContractRegister>();
    public async Task<bool> Handle(UpdateContractRegisterCommand request, CancellationToken cancellationToken)
    {
        var entity = await repo.GetFirstOrDefaultAsync(predicate: p => p.Id == request.CreateModel.Id) ?? throw new BadRequestException("Invalid Id");
        entity.Update(request.CreateModel.Name, request.CreateModel.Year, request.CreateModel.Description);
        repo.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        return true;
    }
}