using Application.Common.Exceptions;
using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using Application.Dto.Catalog;
using MediatR;

namespace Application.Catalog.ContractNumber.Commands;

public record class UpdateContractNumberCommand(ContractNumberDto CreateModel) : IRequest<bool>;

public class UpdateContractNumberCommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<UpdateContractNumberCommand, bool>
{
    private readonly IWriteRepository<Domain.Entities.Category.ContractNumber> repo = _unitOfWork.GetRepository<Domain.Entities.Category.ContractNumber>();
    public async Task<bool> Handle(UpdateContractNumberCommand request, CancellationToken cancellationToken)
    {
        var entity = await repo.GetFirstOrDefaultAsync(predicate: p => p.Id == request.CreateModel.Id) ?? throw new BadRequestException("Invalid Id");
        entity.Update(request.CreateModel.Number, request.CreateModel.SignNumber, request.CreateModel.Description);
        repo.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        return true;
    }
}
