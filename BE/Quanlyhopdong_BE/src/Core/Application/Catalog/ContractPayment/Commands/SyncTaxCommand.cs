using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Catalog.ContractPayment.Commands;

public record SyncTaxCommand(SyncTaxByContractRequest Request) : IRequest<SyncTaxResultDto>;

public class SyncTaxCommandHandler(
    IUnitOfWork unitOfWork,
    ITaxSyncSourceService sourceService,
    ICurrentUser currentUser) : IRequestHandler<SyncTaxCommand, SyncTaxResultDto>
{
    private readonly IWriteRepository<Domain.Entities.Catalog.Contract> _contractRepo = unitOfWork.GetRepository<Domain.Entities.Catalog.Contract>();
    private readonly IWriteRepository<Domain.Entities.Catalog.ContractPayment> _paymentRepo = unitOfWork.GetRepository<Domain.Entities.Catalog.ContractPayment>();

    public async Task<SyncTaxResultDto> Handle(SyncTaxCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Request.ContractNumber))
        {
            throw new BadRequestException("ContractNumber is required");
        }

        Domain.Entities.Catalog.Contract? contract = await _contractRepo.GetFirstOrDefaultAsync(
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
                throw new BadRequestException("Only the Receiving Officer is allowed to sync taxes for this contract.");
            }
        }

        IList<ExternalTaxSyncItemDto> sourceRows = await sourceService.GetTaxesAsync(
            request.Request.SourceConnectionId,
            request.Request.ContractNumber,
            request.Request.ContractDate,
            cancellationToken);

        Dictionary<int, ExternalTaxSyncItemDto> sourceByPeriod = [];
        int skippedCount = 0;

        foreach (ExternalTaxSyncItemDto row in sourceRows)
        {
            string taxCode = row.TaxCode?.Trim() ?? string.Empty;

            if (row.PeriodNumber <= 0 || string.IsNullOrWhiteSpace(taxCode) || row.DeclarationDate == default)
            {
                skippedCount++;
                continue;
            }

            row.TaxCode = taxCode;
            sourceByPeriod[row.PeriodNumber] = row;
        }

        if (sourceByPeriod.Count == 0)
        {
            return new SyncTaxResultDto
            {
                SourceCount = sourceRows.Count,
                CreatedCount = 0,
                UpdatedCount = 0,
                SkippedCount = skippedCount
            };
        }

        IList<Domain.Entities.Catalog.ContractPayment> contractPayments = await _paymentRepo.GetAllAsync(
            predicate: x => x.ContractId == contract.Id,
            include: x => x.Include(y => y.Invoice)
                .Include(y => y.Tax),
            disableTracking: false);

        Dictionary<int, Domain.Entities.Catalog.ContractPayment> paymentByPeriod = contractPayments
            .ToDictionary(x => x.PeriodNumber);

        int createdCount = 0;
        int updatedCount = 0;

        foreach (ExternalTaxSyncItemDto source in sourceByPeriod.Values)
        {
            if (!paymentByPeriod.TryGetValue(source.PeriodNumber, out Domain.Entities.Catalog.ContractPayment? payment))
            {
                skippedCount++;
                continue;
            }

            DateTime? currentDeclarationDate = payment.Tax?.DeclarationDate;
            decimal? currentVatRate = payment.Tax?.VatRate;
            decimal? currentTaxableRevenue = payment.Tax?.TaxableRevenue;
            decimal? currentVatAmount = payment.Tax?.VatAmount;
            string? currentTaxCode = payment.Tax?.TaxCode;

            bool isChanged = !currentDeclarationDate.HasValue
                || currentDeclarationDate.Value.Date != source.DeclarationDate.Date
                || !currentVatRate.HasValue
                || currentVatRate.Value != source.VatRate
                || !currentTaxableRevenue.HasValue
                || currentTaxableRevenue.Value != source.TaxableRevenue
                || !currentVatAmount.HasValue
                || currentVatAmount.Value != source.VatAmount
                || !string.Equals(currentTaxCode, source.TaxCode, StringComparison.Ordinal);

            if (!isChanged)
            {
                continue;
            }

            bool hasTaxBefore = payment.Tax != null;

            payment.Update(
                payment.PaymentScheduleId,
                payment.PeriodNumber,
                payment.PaymentDate,
                payment.Amount,
                payment.AcceptanceReportFilePaths,
                payment.InvoiceFilePaths,
                payment.TaxFilePaths,
                payment.Invoice?.NumberInvoice,
                payment.Invoice?.DateInvoice,
                source.DeclarationDate,
                source.VatRate,
                source.TaxableRevenue,
                source.VatAmount,
                source.TaxCode);

            _paymentRepo.Update(payment);

            if (hasTaxBefore)
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

        return new SyncTaxResultDto
        {
            SourceCount = sourceRows.Count,
            CreatedCount = createdCount,
            UpdatedCount = updatedCount,
            SkippedCount = skippedCount
        };
    }
}