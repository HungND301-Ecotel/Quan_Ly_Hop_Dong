using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.Contracts.Queries;

public record class GetContractPaymentSchedulesQuery(Guid ContractId) : IRequest<List<PaymentScheduleDto>>;

public class GetContractPaymentSchedulesQueryHandler(IContractService contractService) 
    : IRequestHandler<GetContractPaymentSchedulesQuery, List<PaymentScheduleDto>>
{
    public async Task<List<PaymentScheduleDto>> Handle(GetContractPaymentSchedulesQuery request, CancellationToken cancellationToken)
    {
        return await contractService.GetContractPaymentSchedulesAsync(request.ContractId);
    }
}
