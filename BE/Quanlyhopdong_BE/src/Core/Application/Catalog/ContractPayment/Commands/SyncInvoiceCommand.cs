using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Catalog.ContractPayment.Commands;

public record SyncInvoiceCommand(SyncInvoiceByContractRequest Request) : IRequest<SyncInvoiceResultDto>;

public class SyncInvoiceCommandHandler(
    IUnitOfWork unitOfWork,
    IInvoiceSyncSourceService sourceService,
    ICurrentUser currentUser) : IRequestHandler<SyncInvoiceCommand, SyncInvoiceResultDto>
{
    private readonly IWriteRepository<Domain.Entities.Catalog.Contract> _contractRepo = unitOfWork.GetRepository<Domain.Entities.Catalog.Contract>();
    private readonly IWriteRepository<Domain.Entities.Catalog.ContractPayment> _paymentRepo = unitOfWork.GetRepository<Domain.Entities.Catalog.ContractPayment>();

    public async Task<SyncInvoiceResultDto> Handle(SyncInvoiceCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Request.ContractNumber))
        {
            throw new BadRequestException("ContractNumber is required");
        }

        var contract = await _contractRepo.GetFirstOrDefaultAsync(
            predicate: x => x.ContractNumber == request.Request.ContractNumber,
            include: x => x.Include(c => c.ContractUserRoles),
            disableTracking: true);

        if (contract == null)
        {
            throw new NotFoundException($"Contract with number {request.Request.ContractNumber} not found");
        }

        var currentUserId = currentUser.UserId;
        var userRepo = unitOfWork.GetRepository<Domain.Entities.Identity.User>();
        var user = await userRepo.FindAsync(currentUserId);
        var isAdmin = user?.Role == Domain.Common.Enums.UserRole.Admin;

        if (!isAdmin)
        {
            var isAuthorized = contract.ContractUserRoles.Any(r => r.UserId == currentUserId &&
                r.Role == Domain.Common.Enums.ContractRole.ReceivingOfficer);

            if (!isAuthorized)
            {
                throw new BadRequestException("Only the Receiving Officer is allowed to sync invoices for this contract.");
            }
        }

        var sourceRows = await sourceService.GetInvoicesAsync(
            request.Request.SourceConnectionId,
            request.Request.ContractNumber,
            request.Request.ContractDate,
            cancellationToken);

        var sourceByPeriod = new Dictionary<int, ExternalInvoiceSyncItemDto>();
        int skippedCount = 0;

        foreach (var row in sourceRows)
        {
            string numberInvoice = row.NumberInvoice?.Trim() ?? string.Empty;

            if (row.PeriodNumber <= 0 || string.IsNullOrWhiteSpace(numberInvoice))
            {
                skippedCount++;
                continue;
            }

            row.NumberInvoice = numberInvoice;
            sourceByPeriod[row.PeriodNumber] = row;
        }

        if (sourceByPeriod.Count == 0)
        {
            return new SyncInvoiceResultDto
            {
                SourceCount = sourceRows.Count,
                CreatedCount = 0,
                UpdatedCount = 0,
                SkippedCount = skippedCount
            };
        }

        var contractPayments = await _paymentRepo.GetAllAsync(
            predicate: x => x.ContractId == contract.Id,
            include: x => (Microsoft.EntityFrameworkCore.Query.IIncludableQueryable<Domain.Entities.Catalog.ContractPayment, object>)x.Include(y => y.Invoice)
                .Include(y => y.Tax),
            disableTracking: false);

        var paymentByPeriod = contractPayments
            .ToDictionary(x => x.PeriodNumber);

        int createdCount = 0;
        int updatedCount = 0;

        foreach (var source in sourceByPeriod.Values)
        {
            if (!paymentByPeriod.TryGetValue(source.PeriodNumber, out var payment))
            {
                skippedCount++;
                continue;
            }

            string? currentNumberInvoice = payment.Invoice?.NumberInvoice;
            var currentDateInvoice = payment.Invoice?.DateInvoice;

            bool isChanged = !string.Equals(currentNumberInvoice, source.NumberInvoice, StringComparison.Ordinal)
                || !currentDateInvoice.HasValue
                || currentDateInvoice.Value != source.DateInvoice;

            if (!isChanged)
            {
                continue;
            }

            bool hasInvoiceBefore = payment.Invoice != null;

            payment.Update(
                payment.PaymentScheduleId,
                payment.PeriodNumber,
                payment.PaymentDate,
                payment.Amount,
                payment.AcceptanceReportFilePaths,
                payment.InvoiceFilePaths,
                payment.TaxFilePaths,
                source.NumberInvoice,
                source.DateInvoice,
                payment.Tax?.DeclarationDate,
                payment.Tax?.VatRate,
                payment.Tax?.TaxableRevenue,
                payment.Tax?.VatAmount,
                payment.Tax?.TaxCode);

            _paymentRepo.Update(payment);

            if (hasInvoiceBefore)
            {
                updatedCount++;
            }
            else
            {
                createdCount++;
            }
        }

        if (createdCount > 0 || updatedCount > 0)
        {
            await unitOfWork.SaveChangesAsync();
        }

        return new SyncInvoiceResultDto
        {
            SourceCount = sourceRows.Count,
            CreatedCount = createdCount,
            UpdatedCount = updatedCount,
            SkippedCount = skippedCount
        };
    }
}
