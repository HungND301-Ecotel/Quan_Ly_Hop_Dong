using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using Application.Dto.Catalog;
using Application.Dto.Catalog.ContractProgress;
using Application.Interfaces.Services.Catalog;
using Domain.Entities.Catalog;
using Domain.Entities.Catalog.ContractProgress;
using Domain.Entities.Catalog.PaymentSchedule;
using Mapster;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Services.Catalog;

public class ContractProgressService(
    IUnitOfWork unitOfWork,
    ICurrentUser currentUser,
    ILogger<ContractProgressService> logger) : IContractProgressService
{
    private readonly IWriteRepository<ContractProgress> _progressRepo = unitOfWork.GetRepository<ContractProgress>();
    private readonly IWriteRepository<ContractProgressItem> _progressItemRepo = unitOfWork.GetRepository<ContractProgressItem>();
    private readonly IWriteRepository<Contract> _contractRepo = unitOfWork.GetRepository<Contract>();
    private readonly IWriteRepository<ContractItem> _contractItemRepo = unitOfWork.GetRepository<ContractItem>();
    private readonly IWriteRepository<PaymentSchedule> _scheduleRepo = unitOfWork.GetRepository<PaymentSchedule>();
    private readonly IWriteRepository<Domain.Entities.Identity.User> _userRepo = unitOfWork.GetRepository<Domain.Entities.Identity.User>();

    private async Task ValidateProgressPermissionAsync(Guid contractId)
    {
        var currentUserId = currentUser.UserId;
        var user = await _userRepo.FindAsync(currentUserId);
        var isAdmin = user?.Role == Domain.Common.Enums.UserRole.Admin;

        if (isAdmin)
        {
            return;
        }

        var contract = await _contractRepo.GetFirstOrDefaultAsync(
            predicate: c => c.Id == contractId,
            include: c => c.Include(x => x.ContractUserRoles),
            disableTracking: true)
            ?? throw new NotFoundException($"Contract with ID {contractId} not found");

        var isManager = contract.ContractUserRoles.Any(r => r.UserId == currentUserId && r.Role == Domain.Common.Enums.ContractRole.Manager);

        if (!isManager)
        {
            throw new BadRequestException("Only the Direct Contract Manager is allowed to update contract progress.");
        }
    }

    public async Task<ContractProgressDto> GetByIdAsync(Guid id)
    {
        try
        {
            var progress = await _progressRepo.GetFirstOrDefaultAsync(
                predicate: p => p.Id == id,
                include: p => p.Include(x => x.ProgressItems)
                               .ThenInclude(pi => pi.ContractItem)
                               .ThenInclude(ci => ci.Material),
                disableTracking: true);

            if (progress == null)
            {
                throw new NotFoundException($"ContractProgress with ID {id} not found");
            }

            var progressDto = new ContractProgressDto
            {
                Id = progress.Id,
                ContractId = progress.ContractId,
                PaymentScheduleId = progress.PaymentScheduleId,
                PeriodStart = progress.PeriodStart,
                PeriodEnd = progress.PeriodEnd,
                ProgressTotal = progress.ProgressItems.Sum(pi => pi.ExecutedAmount),
                ContractProgressItems = progress.ProgressItems
                    .OrderBy(pi => pi.ContractItem.Material.MaterialCode)
                    .Select(pi => new ContractProgressItemDetailDto
                    {
                        Id = pi.Id,
                        ContractItemId = pi.ContractItem.Id,
                        MaterialCode = pi.ContractItem.Material.MaterialCode,
                        MaterialName = pi.ContractItem.Material.Name,
                        MaterialPrice = pi.ContractItem.Price,
                        ContractQuantity = pi.ContractItem.Quantity,
                        ExecutedQuantity = pi.ExecutedQuantity,
                        TotalItemAmount = pi.ExecutedAmount
                    }).ToList()
            };

            return progressDto;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting contract progress by ID {Id}", id);
            throw;
        }
    }

    public async Task<ContractProgressResponseDto> GetByContractIdAsync(Guid contractId)
    {
        try
        {
            // Verify contract exists
            var contract = await _contractRepo.GetFirstOrDefaultAsync(
                predicate: c => c.Id == contractId,
                disableTracking: true);

            if (contract == null)
            {
                throw new NotFoundException($"Contract with ID {contractId} not found");
            }

            // Get all progress records for the contract
            var progresses = await _progressRepo.GetAllAsync(
                predicate: p => p.ContractId == contractId,
                include: p => p.Include(x => x.ProgressItems)
                               .ThenInclude(pi => pi.ContractItem)
                               .ThenInclude(ci => ci.Material),
                orderBy: q => q.OrderBy(p => p.PeriodStart),
                disableTracking: true);

            if (!progresses.Any())
            {
                return new ContractProgressResponseDto
                {
                    FromDate = null,
                    ToDate = null,
                    Total = 0,
                    ContractProgresses = new List<ContractProgressDto>()
                };
            }

            // Calculate summary
            var fromDate = progresses.Min(p => p.PeriodStart);
            var toDate = progresses.Max(p => p.PeriodEnd);

            // Build cumulative executed quantity tracking per contractItemId across periods
            var cumulativeExecuted = new Dictionary<Guid, decimal>();
            var previousRemaining = new Dictionary<Guid, decimal>();

            var progressDtos = new List<ContractProgressDto>();

            foreach (var progress in progresses)
            {
                var items = new List<ContractProgressItemDetailDto>();

                foreach (var pi in progress.ProgressItems.OrderBy(pi => pi.ContractItem.Material.MaterialCode))
                {
                    var contractItemId = pi.ContractItem.Id;
                    var contractQty = pi.ContractItem.Quantity;
                    var executedQty = pi.ExecutedQuantity;

                    // Calculate cumulative executed up to current period
                    if (!cumulativeExecuted.ContainsKey(contractItemId))
                    {
                        cumulativeExecuted[contractItemId] = 0;
                    }
                    cumulativeExecuted[contractItemId] += executedQty;

                    // Calculate remaining quantity after this period
                    // remainingQuantity = contractQuantity - cumulative executed
                    var remainingQty = Math.Max(0, contractQty - cumulativeExecuted[contractItemId]);

                    // Calculate max executable quantity for current period
                    // First period: max = contractQuantity
                    // Later periods: max = remaining quantity from previous period
                    decimal maxExecutableQty;
                    if (previousRemaining.TryGetValue(contractItemId, out var prevRemaining))
                    {
                        maxExecutableQty = Math.Max(0, prevRemaining);
                    }
                    else
                    {
                        // First period
                        maxExecutableQty = contractQty;
                    }

                    items.Add(new ContractProgressItemDetailDto
                    {
                        Id = pi.Id,
                        ContractItemId = contractItemId,
                        MaterialCode = pi.ContractItem.Material.MaterialCode,
                        MaterialName = pi.ContractItem.Material.Name,
                        MaterialPrice = pi.ContractItem.Price,
                        ContractQuantity = contractQty,
                        ExecutedQuantity = executedQty,
                        TotalItemAmount = pi.ExecutedAmount,
                        RemainingQuantity = remainingQty,
                        MaxExecutableQuantity = maxExecutableQty
                    });

                    // Update previous remaining for next period
                    previousRemaining[contractItemId] = remainingQty;
                }

                progressDtos.Add(new ContractProgressDto
                {
                    Id = progress.Id,
                    ContractId = progress.ContractId,
                    PaymentScheduleId = progress.PaymentScheduleId,
                    PeriodStart = progress.PeriodStart,
                    PeriodEnd = progress.PeriodEnd,
                    ProgressTotal = progress.ProgressItems.Sum(pi => pi.ExecutedAmount),
                    ContractProgressItems = items
                });
            }

            var total = progressDtos.Sum(p => p.ProgressTotal);

            return new ContractProgressResponseDto
            {
                FromDate = fromDate,
                ToDate = toDate,
                Total = total,
                ContractProgresses = progressDtos
            };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting contract progress for contract {ContractId}", contractId);
            throw;
        }
    }

    public async Task<CreateContractProgressResponse> CreateAsync(CreateContractProgressRequest request)
    {
        try
        {
            // Validate contract exists
            var contract = await _contractRepo.GetFirstOrDefaultAsync(
                predicate: c => c.Id == request.ContractId,
                disableTracking: true);

            if (contract == null)
            {
                throw new NotFoundException($"Contract with ID {request.ContractId} not found");
            }

            await ValidateProgressPermissionAsync(request.ContractId);

            // Validate period
            if (request.PeriodStart >= request.PeriodEnd)
            {
                throw new BadRequestException("Period start must be before period end");
            }

            // Check for period overlap
            var hasOverlap = await _progressRepo.AnyAsync(
                predicate: p => p.ContractId == request.ContractId &&
                               ((request.PeriodStart >= p.PeriodStart && request.PeriodStart < p.PeriodEnd) ||
                                (request.PeriodEnd > p.PeriodStart && request.PeriodEnd <= p.PeriodEnd) ||
                                (request.PeriodStart <= p.PeriodStart && request.PeriodEnd >= p.PeriodEnd)));

            if (hasOverlap)
            {
                throw new ConflictException("Period overlaps with existing progress record");
            }

            await unitOfWork.BeginTransactionAsync();

            try
            {
                // Validate PaymentSchedule if provided
                if (request.PaymentScheduleId.HasValue)
                {
                    var schedule = await _scheduleRepo.GetFirstOrDefaultAsync(
                        predicate: s => s.Id == request.PaymentScheduleId.Value,
                        disableTracking: true);

                    if (schedule == null)
                    {
                        throw new BadRequestException("PaymentSchedule not found");
                    }

                    if (schedule.ContractId != request.ContractId)
                    {
                        throw new BadRequestException("PaymentSchedule không thuộc Contract này");
                    }
                }

                // Create progress entity
                var progress = ContractProgress.Create(
                    request.ContractId,
                    request.PaymentScheduleId,
                    request.PeriodStart,
                    request.PeriodEnd);

                await _progressRepo.InsertAsync(progress);
                await unitOfWork.SaveChangesAsync();

                // Auto-create progress items for all contract items
                var contractItems = await _contractItemRepo.GetAllAsync(
                    predicate: ci => ci.ContractId == request.ContractId,
                    disableTracking: true);

                foreach (var contractItem in contractItems)
                {
                    var progressItem = ContractProgressItem.Create(
                        progress.Id,
                        contractItem.Id,
                        0, // Default quantity = 0
                        contractItem.Price);

                    await _progressItemRepo.InsertAsync(progressItem);
                }

                await unitOfWork.SaveChangesAsync();
                await unitOfWork.CommitAsync();

                var response = new CreateContractProgressResponse
                {
                    Id = progress.Id,
                    ContractId = progress.ContractId,
                    PeriodStart = progress.PeriodStart,
                    PeriodEnd = progress.PeriodEnd,
                    CreatedAt = progress.CreatedOn
                };

                return response;
            }
            catch
            {
                await unitOfWork.RollbackAsync();
                throw;
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error creating contract progress");
            throw;
        }
    }

    public async Task<AddContractProgressItemsResponse> AddProgressItemsBatchAsync(AddContractProgressItemsRequest request)
    {
        try
        {
            if (request.Items == null || !request.Items.Any())
            {
                throw new BadRequestException("No items provided");
            }

            await unitOfWork.BeginTransactionAsync();

            try
            {
                // Group by ContractProgressId for validation
                var progressIds = request.Items.Select(i => i.ContractProgressId).Distinct().ToList();

                // Validate all progress records exist
                var progresses = await _progressRepo.GetAllAsync(
                    predicate: p => progressIds.Contains(p.Id),
                    include: p => p.Include(x => x.Contract)
                                   .ThenInclude(c => c.ContractItems),
                    disableTracking: false);

                if (progresses.Count != progressIds.Count)
                {
                    throw new NotFoundException("One or more ContractProgress records not found");
                }

                var contractIds = progresses.Select(p => p.ContractId).Distinct().ToList();
                foreach (var contractId in contractIds)
                {
                    await ValidateProgressPermissionAsync(contractId);
                }

                // Get all contract item IDs
                var contractItemIds = request.Items.Select(i => i.ContractItemId).Distinct().ToList();
                var contractItems = await _contractItemRepo.GetAllAsync(
                    predicate: ci => contractItemIds.Contains(ci.Id),
                    include: ci => ci.Include(x => x.Material),
                    disableTracking: true);

                // Check for existing progress items to prevent duplicates
                var existingItems = await _progressItemRepo.GetAllAsync(
                    predicate: pi => progressIds.Contains(pi.ContractProgressId) &&
                                    contractItemIds.Contains(pi.ContractItemId),
                    disableTracking: true);

                var existingKeys = existingItems
                    .Select(ei => $"{ei.ContractProgressId}_{ei.ContractItemId}")
                    .ToHashSet();

                // Validate ALL items first before making any changes
                foreach (var itemRequest in request.Items)
                {
                    var itemKey = $"{itemRequest.ContractProgressId}_{itemRequest.ContractItemId}";

                    // Check duplicate
                    if (existingKeys.Contains(itemKey))
                    {
                        throw new BadRequestException($"Item already exists in progress record for contract item {itemRequest.ContractItemId}");
                    }

                    var progress = progresses.FirstOrDefault(p => p.Id == itemRequest.ContractProgressId);
                    if (progress == null)
                    {
                        throw new BadRequestException($"Contract progress {itemRequest.ContractProgressId} not found");
                    }

                    var contractItem = contractItems.FirstOrDefault(ci => ci.Id == itemRequest.ContractItemId);
                    if (contractItem == null)
                    {
                        throw new BadRequestException($"Contract item {itemRequest.ContractItemId} not found");
                    }

                    // Validate contract item belongs to the same contract
                    if (contractItem.ContractId != progress.ContractId)
                    {
                        throw new BadRequestException($"Contract item {itemRequest.ContractItemId} does not belong to contract {progress.ContractId}");
                    }

                    // Validate executed quantity
                    if (itemRequest.ExecutedQuantity < 0)
                    {
                        throw new BadRequestException($"Executed quantity cannot be negative for contract item {itemRequest.ContractItemId}");
                    }

                    // Check total executed quantity doesn't exceed contract quantity
                    var totalExecuted = await _progressItemRepo.GetAllAsync(
                        predicate: pi => pi.ContractItemId == itemRequest.ContractItemId,
                        disableTracking: true);

                    var currentTotal = totalExecuted.Sum(te => te.ExecutedQuantity);
                    if (currentTotal + itemRequest.ExecutedQuantity > contractItem.Quantity)
                    {
                        throw new BadRequestException($"Executed quantity exceeds contract quantity for item {itemRequest.ContractItemId}. Remaining: {contractItem.Quantity - currentTotal}");
                    }

                    // Add to prevent duplicates in same batch
                    existingKeys.Add(itemKey);
                }

                // All validations passed, now create all items
                var results = new List<BatchItemResult>();
                var successCount = 0;

                foreach (var itemRequest in request.Items)
                {
                    var progress = progresses.First(p => p.Id == itemRequest.ContractProgressId);
                    var contractItem = contractItems.First(ci => ci.Id == itemRequest.ContractItemId);

                    var progressItem = ContractProgressItem.Create(
                        itemRequest.ContractProgressId,
                        itemRequest.ContractItemId,
                        itemRequest.ExecutedQuantity,
                        contractItem.Price);

                    await _progressItemRepo.InsertAsync(progressItem);

                    results.Add(new BatchItemResult
                    {
                        ContractItemId = itemRequest.ContractItemId,
                        Success = true,
                        Message = "Item added successfully"
                    });
                    successCount++;
                }

                await unitOfWork.SaveChangesAsync();
                await unitOfWork.CommitAsync();

                return new AddContractProgressItemsResponse
                {
                    SuccessCount = successCount,
                    FailedCount = 0,
                    Results = results
                };
            }
            catch
            {
                await unitOfWork.RollbackAsync();
                throw;
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error in batch add progress items");
            throw;
        }
    }

    public async Task<YearlySummaryListDto> GetYearlySummaryAsync(Guid contractId)
    {
        try
        {
            var contract = await _contractRepo.GetFirstOrDefaultAsync(
                predicate: c => c.Id == contractId,
                disableTracking: true);

            if (contract == null)
            {
                throw new NotFoundException($"Contract with ID {contractId} not found");
            }

            var progressItems = await _progressItemRepo.GetAllAsync(
                predicate: pi => pi.ContractItem.ContractId == contractId,
                include: pi => pi.Include(x => x.ContractProgress)
                               .Include(x => x.ContractItem)
                               .ThenInclude(ci => ci.Material),
                disableTracking: true);

            if (!progressItems.Any())
            {
                return new YearlySummaryListDto
                {
                    FromYear = 0,
                    ToYear = 0,
                    Total = 0,
                    TotalQuantity = 0,
                    YearlySummaries = new List<YearlySummaryDto>()
                };
            }

            var fromYear = progressItems.Min(pi => pi.ContractProgress.PeriodStart.Year);
            var toYear = progressItems.Max(pi => pi.ContractProgress.PeriodStart.Year);

            // Get all contract items
            var contractItems = await _contractItemRepo.GetAllAsync(
                predicate: ci => ci.ContractId == contractId,
                include: ci => ci.Include(x => x.Material),
                orderBy: q => q.OrderBy(ci => ci.Material.MaterialCode)
                              .ThenBy(ci => ci.Material.Name),
                disableTracking: true);

            // Group by year + contract item
            var yearlyData = progressItems
                .GroupBy(pi => new
                {
                    Year = pi.ContractProgress.PeriodStart.Year,
                    ContractItemId = pi.ContractItemId
                })
                .ToDictionary(
                    g => g.Key,
                    g => g.Sum(pi => pi.ExecutedQuantity)
                );

            // Build result for each year
            var yearSummaries = new List<YearlySummaryDto>();
            decimal grandTotal = 0;
            decimal totalQuantity = 0;

            for (int year = fromYear; year <= toYear; year++)
            {
                decimal yearTotal = 0;

                var yearSummary = new YearlySummaryDto
                {
                    Year = year,
                    ContractItems = contractItems.Select(item =>
                    {
                        var key = new { Year = year, ContractItemId = item.Id };
                        var executedQty = yearlyData.ContainsKey(key) ? yearlyData[key] : 0;
                        var totalAmount = executedQty * item.Price;

                        // Accumulate year total, grand total, and total quantity
                        yearTotal += totalAmount;
                        grandTotal += totalAmount;
                        totalQuantity += executedQty;

                        return new YearlySummaryItemDto
                        {
                            Id = item.Id,
                            MaterialCode = item.Material.MaterialCode ?? string.Empty,
                            MaterialName = item.Material.Name ?? string.Empty,
                            MaterialPrice = item.Price,
                            ContractQuantity = item.Quantity,
                            ExecutedQuantity = executedQty,
                            TotalItemAmount = totalAmount
                        };
                    }).ToList()
                };

                yearSummary.YearTotal = yearTotal;
                yearSummaries.Add(yearSummary);
            }

            return new YearlySummaryListDto
            {
                FromYear = fromYear,
                ToYear = toYear,
                Total = (int)grandTotal,
                TotalQuantity = (int)totalQuantity,
                YearlySummaries = yearSummaries
            };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting yearly summary for contract {ContractId}", contractId);
            throw;
        }
    }

    public async Task<CreateContractProgressBatchResponse> CreateBatchAsync(CreateContractProgressBatchRequest request)
    {
        try
        {
            if (request.Items == null || !request.Items.Any())
            {
                throw new BadRequestException("No items provided");
            }

            await unitOfWork.BeginTransactionAsync();

            try
            {
                // Validate ALL items first before making any changes
                var contractIds = request.Items.Select(i => i.ContractId).Distinct().ToList();
                var contracts = await _contractRepo.GetAllAsync(
                    predicate: c => contractIds.Contains(c.Id),
                    disableTracking: true);

                var contractMap = contracts.ToDictionary(c => c.Id);

                foreach (var contractId in contractIds)
                {
                    await ValidateProgressPermissionAsync(contractId);
                }

                foreach (var item in request.Items)
                {
                    // Validate contract exists
                    if (!contractMap.ContainsKey(item.ContractId))
                    {
                        throw new BadRequestException($"Contract {item.ContractId} not found");
                    }

                    // Validate period
                    if (item.PeriodStart >= item.PeriodEnd)
                    {
                        throw new BadRequestException($"Period start must be before period end for contract {item.ContractId}");
                    }

                    // Check for period overlap
                    var hasOverlap = await _progressRepo.AnyAsync(
                        predicate: p => p.ContractId == item.ContractId &&
                                       ((item.PeriodStart >= p.PeriodStart && item.PeriodStart < p.PeriodEnd) ||
                                        (item.PeriodEnd > p.PeriodStart && item.PeriodEnd <= p.PeriodEnd) ||
                                        (item.PeriodStart <= p.PeriodStart && item.PeriodEnd >= p.PeriodEnd)));

                    if (hasOverlap)
                    {
                        throw new BadRequestException($"Period overlaps with existing progress record for contract {item.ContractId}");
                    }
                }

                // All validations passed, now create all progress records
                var results = new List<CreateBatchResult>();
                var successCount = 0;

                foreach (var item in request.Items)
                {
                    // Validate PaymentSchedule if provided
                    if (item.PaymentScheduleId.HasValue)
                    {
                        var schedule = await _scheduleRepo.GetFirstOrDefaultAsync(
                            predicate: s => s.Id == item.PaymentScheduleId.Value,
                            disableTracking: true);

                        if (schedule == null || schedule.ContractId != item.ContractId)
                        {
                            results.Add(new CreateBatchResult
                            {
                                Id = null,
                                Success = false,
                                Message = "Invalid PaymentSchedule"
                            });
                            continue;
                        }
                    }

                    var progress = ContractProgress.Create(
                        item.ContractId,
                        item.PaymentScheduleId,
                        item.PeriodStart,
                        item.PeriodEnd);

                    await _progressRepo.InsertAsync(progress);
                    await unitOfWork.SaveChangesAsync();

                    results.Add(new CreateBatchResult
                    {
                        Id = progress.Id,
                        Success = true,
                        Message = "Created successfully"
                    });
                    successCount++;
                }

                await unitOfWork.CommitAsync();

                return new CreateContractProgressBatchResponse
                {
                    SuccessCount = successCount,
                    FailedCount = 0,
                    Results = results
                };
            }
            catch
            {
                await unitOfWork.RollbackAsync();
                throw;
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error in batch create contract progress");
            throw;
        }
    }

    public async Task<UpdateContractProgressBatchResponse> UpdateContractProgressBatchAsync(UpdateContractProgressBatchRequest request)
    {
        try
        {
            // Validate contract exists
            var contract = await _contractRepo.GetFirstOrDefaultAsync(
                predicate: c => c.Id == request.ContractId,
                include: c => c.Include(x => x.ContractProgresses),
                disableTracking: false);

            if (contract == null)
            {
                throw new NotFoundException($"Contract with ID {request.ContractId} not found");
            }

            await ValidateProgressPermissionAsync(request.ContractId);

            await unitOfWork.BeginTransactionAsync();

            try
            {
                var existingProgresses = contract.ContractProgresses.ToList();
                var requestProgressIds = request.Items
                    .Where(i => i.Id.HasValue && i.Id.Value != Guid.Empty)
                    .Select(i => i.Id!.Value)
                    .ToHashSet();

                // Validate all items first
                foreach (var item in request.Items)
                {
                    // Validate period
                    if (item.PeriodStart >= item.PeriodEnd)
                    {
                        throw new BadRequestException("Period start must be before period end");
                    }

                    // Check if Update
                    if (item.Id.HasValue && item.Id.Value != Guid.Empty)
                    {
                        var existing = existingProgresses.FirstOrDefault(p => p.Id == item.Id.Value);
                        if (existing == null)
                        {
                            throw new BadRequestException($"Contract progress {item.Id} not found");
                        }

                        // Check overlap with other progress records (excluding current)
                        var hasOverlap = await _progressRepo.AnyAsync(
                            predicate: p => p.ContractId == request.ContractId &&
                                           p.Id != item.Id.Value &&
                                           ((item.PeriodStart >= p.PeriodStart && item.PeriodStart < p.PeriodEnd) ||
                                            (item.PeriodEnd > p.PeriodStart && item.PeriodEnd <= p.PeriodEnd) ||
                                            (item.PeriodStart <= p.PeriodStart && item.PeriodEnd >= p.PeriodEnd)));

                        if (hasOverlap)
                        {
                            throw new BadRequestException($"Period overlaps with existing progress record");
                        }
                    }
                    else
                    {
                        // Check overlap for new progress
                        var hasOverlap = await _progressRepo.AnyAsync(
                            predicate: p => p.ContractId == request.ContractId &&
                                           ((item.PeriodStart >= p.PeriodStart && item.PeriodStart < p.PeriodEnd) ||
                                            (item.PeriodEnd > p.PeriodStart && item.PeriodEnd <= p.PeriodEnd) ||
                                            (item.PeriodStart <= p.PeriodStart && item.PeriodEnd >= p.PeriodEnd)));

                        if (hasOverlap)
                        {
                            throw new BadRequestException("Period overlaps with existing progress record");
                        }
                    }
                }

                var results = new List<UpdateContractProgressBatchResult>();
                var addedCount = 0;
                var updatedCount = 0;
                var deletedCount = 0;

                // Delete progresses not in request
                var progressesToDelete = existingProgresses
                    .Where(p => !requestProgressIds.Contains(p.Id))
                    .ToList();

                foreach (var progressToDelete in progressesToDelete)
                {
                    // Delete progress items first
                    var progressItems = await _progressItemRepo.GetAllAsync(
                        predicate: pi => pi.ContractProgressId == progressToDelete.Id,
                        disableTracking: false);

                    if (progressItems.Any())
                    {
                        _progressItemRepo.Delete(progressItems);
                    }

                    _progressRepo.Delete(progressToDelete);

                    results.Add(new UpdateContractProgressBatchResult
                    {
                        Id = progressToDelete.Id,
                        Operation = "Deleted",
                        Success = true,
                        Message = "Progress deleted successfully"
                    });
                    deletedCount++;
                }

                // Add or Update progresses
                foreach (var item in request.Items)
                {
                    if (!item.Id.HasValue || item.Id.Value == Guid.Empty)
                    {
                        // ADD NEW
                        // Validate PaymentSchedule if provided
                        if (item.PaymentScheduleId.HasValue)
                        {
                            var schedule = await _scheduleRepo.GetFirstOrDefaultAsync(
                                predicate: s => s.Id == item.PaymentScheduleId.Value,
                                disableTracking: true);

                            if (schedule == null || schedule.ContractId != request.ContractId)
                            {
                                results.Add(new UpdateContractProgressBatchResult
                                {
                                    Id = item.Id,
                                    Operation = "Add Failed",
                                    Success = false,
                                    Message = "Invalid PaymentSchedule"
                                });
                                continue;
                            }
                        }

                        var newProgress = ContractProgress.Create(
                            request.ContractId,
                            item.PaymentScheduleId,
                            item.PeriodStart,
                            item.PeriodEnd);

                        await _progressRepo.InsertAsync(newProgress);
                        await unitOfWork.SaveChangesAsync();

                        // Auto-create progress items for all contract items
                        var contractItems = await _contractItemRepo.GetAllAsync(
                            predicate: ci => ci.ContractId == request.ContractId,
                            disableTracking: true);

                        foreach (var contractItem in contractItems)
                        {
                            var progressItem = ContractProgressItem.Create(
                                newProgress.Id,
                                contractItem.Id,
                                0, // Default quantity = 0
                                contractItem.Price);

                            await _progressItemRepo.InsertAsync(progressItem);
                        }

                        results.Add(new UpdateContractProgressBatchResult
                        {
                            Id = newProgress.Id,
                            Operation = "Added",
                            Success = true,
                            Message = "Progress created successfully"
                        });
                        addedCount++;
                    }
                    else
                    {
                        // UPDATE EXISTING
                        var existing = existingProgresses.First(p => p.Id == item.Id.Value);

                        // Validate PaymentSchedule if provided
                        if (item.PaymentScheduleId.HasValue)
                        {
                            var schedule = await _scheduleRepo.GetFirstOrDefaultAsync(
                                predicate: s => s.Id == item.PaymentScheduleId.Value,
                                disableTracking: true);

                            if (schedule == null || schedule.ContractId != request.ContractId)
                            {
                                results.Add(new UpdateContractProgressBatchResult
                                {
                                    Id = item.Id,
                                    Operation = "Update Failed",
                                    Success = false,
                                    Message = "Invalid PaymentSchedule"
                                });
                                continue;
                            }
                        }

                        existing.Update(item.PaymentScheduleId, item.PeriodStart, item.PeriodEnd);
                        _progressRepo.Update(existing);

                        results.Add(new UpdateContractProgressBatchResult
                        {
                            Id = existing.Id,
                            Operation = "Updated",
                            Success = true,
                            Message = "Progress updated successfully"
                        });
                        updatedCount++;
                    }
                }

                await unitOfWork.SaveChangesAsync();
                await unitOfWork.CommitAsync();

                return new UpdateContractProgressBatchResponse
                {
                    AddedCount = addedCount,
                    UpdatedCount = updatedCount,
                    DeletedCount = deletedCount,
                    Results = results
                };
            }
            catch
            {
                await unitOfWork.RollbackAsync();
                throw;
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error in batch update contract progress");
            throw;
        }
    }

    public async Task UpdateAsync(UpdateContractProgressRequest request)
    {
        try
        {
            var progress = await _progressRepo.GetFirstOrDefaultAsync(
                predicate: p => p.Id == request.Id,
                disableTracking: false);

            if (progress == null)
            {
                throw new NotFoundException($"Contract progress with ID {request.Id} not found");
            }

            // Validate period
            if (request.PeriodStart >= request.PeriodEnd)
            {
                throw new BadRequestException("Period start must be before period end");
            }

            // Check for period overlap (excluding current record)
            var hasOverlap = await _progressRepo.AnyAsync(
                predicate: p => p.ContractId == progress.ContractId &&
                               p.Id != request.Id &&
                               ((request.PeriodStart >= p.PeriodStart && request.PeriodStart < p.PeriodEnd) ||
                                (request.PeriodEnd > p.PeriodStart && request.PeriodEnd <= p.PeriodEnd) ||
                                (request.PeriodStart <= p.PeriodStart && request.PeriodEnd >= p.PeriodEnd)));

            if (hasOverlap)
            {
                throw new ConflictException("Period overlaps with existing progress record");
            }

            await unitOfWork.BeginTransactionAsync();

            try
            {
                // Validate PaymentSchedule if provided
                if (request.PaymentScheduleId.HasValue)
                {
                    var schedule = await _scheduleRepo.GetFirstOrDefaultAsync(
                        predicate: s => s.Id == request.PaymentScheduleId.Value,
                        disableTracking: true);

                    if (schedule == null)
                    {
                        throw new BadRequestException("PaymentSchedule not found");
                    }

                    if (schedule.ContractId != progress.ContractId)
                    {
                        throw new BadRequestException("PaymentSchedule không thuộc Contract này");
                    }
                }

                progress.Update(
                    request.PaymentScheduleId,
                    request.PeriodStart,
                    request.PeriodEnd);

                _progressRepo.Update(progress);
                await unitOfWork.SaveChangesAsync();
                await unitOfWork.CommitAsync();
            }
            catch
            {
                await unitOfWork.RollbackAsync();
                throw;
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error updating contract progress {Id}", request.Id);
            throw;
        }
    }

    public async Task<DeleteContractProgressResponse> DeleteAsync(Guid id)
    {
        try
        {
            var progress = await _progressRepo.GetFirstOrDefaultAsync(
                predicate: p => p.Id == id,
                include: p => p.Include(x => x.ProgressItems),
                disableTracking: false);

            if (progress == null)
            {
                throw new NotFoundException($"Contract progress with ID {id} not found");
            }

            await unitOfWork.BeginTransactionAsync();

            try
            {
                // Delete all progress items first
                if (progress.ProgressItems.Any())
                {
                    _progressItemRepo.Delete(progress.ProgressItems);
                }

                // Delete progress
                _progressRepo.Delete(progress);
                await unitOfWork.SaveChangesAsync();
                await unitOfWork.CommitAsync();

                return new DeleteContractProgressResponse
                {
                    Id = id,
                    Success = true,
                    Message = "Contract progress deleted successfully"
                };
            }
            catch
            {
                await unitOfWork.RollbackAsync();
                throw;
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error deleting contract progress {Id}", id);
            throw;
        }
    }

    public async Task<UpdateContractProgressItemsBatchResponse> UpdateItemsBatchAsync(
        UpdateContractProgressItemsBatchRequest request)
    {
        try
        {
            // Validate progress exists
            var progress = await _progressRepo.GetFirstOrDefaultAsync(
                predicate: p => p.Id == request.ContractProgressId,
                include: p => p.Include(x => x.ProgressItems)
                               .Include(x => x.Contract)
                               .ThenInclude(c => c.ContractItems),
                disableTracking: false);

            if (progress == null)
            {
                throw new NotFoundException($"Contract progress with ID {request.ContractProgressId} not found");
            }

            await unitOfWork.BeginTransactionAsync();

            try
            {
                var existingItems = progress.ProgressItems.ToList();
                var requestItemIds = request.Items
                    .Where(i => i.Id.HasValue && i.Id.Value != Guid.Empty)
                    .Select(i => i.Id!.Value)
                    .ToHashSet();

                foreach (var itemRequest in request.Items)
                {
                    var contractItem = progress.Contract.ContractItems
                        .FirstOrDefault(ci => ci.Id == itemRequest.ContractItemId);

                    if (contractItem == null)
                    {
                        throw new BadRequestException($"Contract item {itemRequest.ContractItemId} not found");
                    }

                    if (itemRequest.ExecutedQuantity < 0)
                    {
                        throw new BadRequestException($"Executed quantity cannot be negative for contract item {itemRequest.ContractItemId}");
                    }

                    if (!itemRequest.Id.HasValue || itemRequest.Id.Value == Guid.Empty)
                    {
                        if (existingItems.Any(ei => ei.ContractItemId == itemRequest.ContractItemId))
                        {
                            throw new BadRequestException($"Item already exists for contract item {itemRequest.ContractItemId}");
                        }

                        var allProgressItems = await _progressItemRepo.GetAllAsync(
                            predicate: pi => pi.ContractItemId == itemRequest.ContractItemId,
                            disableTracking: true);

                        var totalExecutedAcrossAllProgress = allProgressItems.Sum(pi => pi.ExecutedQuantity);

                        if (totalExecutedAcrossAllProgress + itemRequest.ExecutedQuantity > contractItem.Quantity)
                        {
                            throw new BadRequestException($"Executed quantity exceeds contract quantity for item {itemRequest.ContractItemId}. Total across all progress: {totalExecutedAcrossAllProgress}, Contract quantity: {contractItem.Quantity}");
                        }
                    }
                    else
                    {
                        var existingItem = existingItems.FirstOrDefault(ei => ei.Id == itemRequest.Id.Value);

                        if (existingItem == null)
                        {
                            throw new BadRequestException($"Progress item {itemRequest.Id} not found");
                        }

                        var allProgressItems = await _progressItemRepo.GetAllAsync(
                            predicate: pi => pi.ContractItemId == itemRequest.ContractItemId && pi.Id != itemRequest.Id.Value,
                            disableTracking: true);

                        var totalExecutedAcrossAllProgress = allProgressItems.Sum(pi => pi.ExecutedQuantity);

                        if (totalExecutedAcrossAllProgress + itemRequest.ExecutedQuantity > contractItem.Quantity)
                        {
                            throw new BadRequestException($"Executed quantity exceeds contract quantity for item {itemRequest.ContractItemId}. Total across all progress (excluding current): {totalExecutedAcrossAllProgress}, Contract quantity: {contractItem.Quantity}");
                        }
                    }
                }

                var results = new List<UpdateBatchItemResult>();
                var addedCount = 0;
                var updatedCount = 0;
                var deletedCount = 0;

                var itemsToDelete = existingItems
                    .Where(ei => !requestItemIds.Contains(ei.Id))
                    .ToList();

                foreach (var itemToDelete in itemsToDelete)
                {
                    _progressItemRepo.Delete(itemToDelete);
                    results.Add(new UpdateBatchItemResult
                    {
                        Id = itemToDelete.Id,
                        ContractItemId = itemToDelete.ContractItemId,
                        Operation = "Deleted",
                        Success = true,
                        Message = "Item deleted successfully"
                    });
                    deletedCount++;
                }

                foreach (var itemRequest in request.Items)
                {
                    var contractItem = progress.Contract.ContractItems
                        .First(ci => ci.Id == itemRequest.ContractItemId);

                    if (!itemRequest.Id.HasValue || itemRequest.Id.Value == Guid.Empty)
                    {
                        var newItem = ContractProgressItem.Create(
                            request.ContractProgressId,
                            itemRequest.ContractItemId,
                            itemRequest.ExecutedQuantity,
                            contractItem.Price);

                        await _progressItemRepo.InsertAsync(newItem);

                        results.Add(new UpdateBatchItemResult
                        {
                            Id = newItem.Id,
                            ContractItemId = itemRequest.ContractItemId,
                            Operation = "Added",
                            Success = true,
                            Message = "Item added successfully"
                        });
                        addedCount++;
                    }
                    else
                    {
                        var existingItem = existingItems.First(ei => ei.Id == itemRequest.Id.Value);

                        existingItem.Update(
                            itemRequest.ExecutedQuantity,
                            contractItem.Price);

                        _progressItemRepo.Update(existingItem);

                        results.Add(new UpdateBatchItemResult
                        {
                            Id = existingItem.Id,
                            ContractItemId = itemRequest.ContractItemId,
                            Operation = "Updated",
                            Success = true,
                            Message = "Item updated successfully"
                        });
                        updatedCount++;
                    }
                }

                await unitOfWork.SaveChangesAsync();
                await unitOfWork.CommitAsync();

                return new UpdateContractProgressItemsBatchResponse
                {
                    AddedCount = addedCount,
                    UpdatedCount = updatedCount,
                    DeletedCount = deletedCount,
                    FailedCount = 0,
                    Results = results
                };
            }
            catch
            {
                await unitOfWork.RollbackAsync();
                throw;
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error in batch update progress items");
            throw;
        }
    }

    public async Task<WorkInProgressDto> GetWorkInProgressAsync(Guid contractId)
    {
        try
        {
            // Validate contract exists
            var contract = await _contractRepo.GetFirstOrDefaultAsync(
                predicate: c => c.Id == contractId,
                disableTracking: true);

            if (contract == null)
            {
                throw new NotFoundException($"Contract with ID {contractId} not found");
            }

            // Get all contract items with materials
            var contractItems = await _contractItemRepo.GetAllAsync(
                predicate: ci => ci.ContractId == contractId,
                include: ci => ci.Include(x => x.Material),
                disableTracking: true);

            // Get all executed quantities from all progress items
            var progressItems = await _progressItemRepo.GetAllAsync(
                predicate: pi => pi.ContractItem.ContractId == contractId,
                include: pi => pi.Include(x => x.ContractItem)
                               .ThenInclude(ci => ci.Material),
                disableTracking: true);

            // Group by contract item and sum executed quantities
            var executedQuantities = progressItems
                .GroupBy(pi => pi.ContractItemId)
                .ToDictionary(
                    g => g.Key,
                    g => g.Sum(pi => pi.ExecutedQuantity)
                );

            // Build work in progress items
            var items = contractItems
                .OrderBy(ci => ci.Material.MaterialCode)
                .ThenBy(ci => ci.Material.Name)
                .Select(ci =>
                {
                    var executedQty = executedQuantities.ContainsKey(ci.Id)
                        ? executedQuantities[ci.Id]
                        : 0;

                    return new WorkInProgressItemDto
                    {
                        MaterialCode = ci.Material.MaterialCode ?? string.Empty,
                        MaterialName = ci.Material.Name ?? string.Empty,
                        MaterialPrice = ci.Price,
                        ContractQuantity = ci.Quantity,
                        ExecutedQuantity = executedQty,
                        TotalItemAmount = executedQty * ci.Price
                    };
                })
                .ToList();

            // Calculate total amount
            var totalAmount = items.Sum(i => i.TotalItemAmount);

            return new WorkInProgressDto
            {
                TotalAmount = totalAmount,
                Items = items
            };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting work in progress for contract {ContractId}", contractId);
            throw;
        }
    }

    public async Task<List<ContractItemDto>> GetContractItemsByContractIdAsync(Guid contractId)
    {
        try
        {
            // Validate contract exists
            var contract = await _contractRepo.GetFirstOrDefaultAsync(
                predicate: c => c.Id == contractId,
                disableTracking: true);

            if (contract == null)
            {
                throw new NotFoundException($"Contract with ID {contractId} not found");
            }

            // Get all contract items with material details
            var contractItems = await _contractItemRepo.GetAllAsync(
                predicate: ci => ci.ContractId == contractId,
                include: ci => ci.Include(x => x.Material),
                orderBy: q => q.OrderBy(ci => ci.Material.MaterialCode)
                              .ThenBy(ci => ci.Material.Name),
                disableTracking: true);

            // Map to DTO with proper MaterialCode mapping
            var itemDtos = contractItems.Select(ci => new ContractItemDto
            {
                Id = ci.Id,
                IsOtherMaterial = ci.Material.IsOtherMaterial,
                ContractId = ci.ContractId,
                MaterialId = ci.MaterialId,
                MaterialCode = ci.Material.MaterialCode,
                MaterialName = ci.Material.Name,
                Price = ci.Price,
                Quantity = ci.Quantity,
                Amount = ci.Amount
            }).ToList();

            return itemDtos;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting contract items for contract {ContractId}", contractId);
            throw;
        }
    }

    public async Task<CreateContractProgressWithItemsResponse> CreateContractProgressWithItemsAsync(
        CreateContractProgressWithItemsRequest request)
    {
        try
        {
            // Validate contract exists
            var contract = await _contractRepo.GetFirstOrDefaultAsync(
                predicate: c => c.Id == request.ContractId,
                disableTracking: true);

            if (contract == null)
            {
                throw new NotFoundException($"Contract with ID {request.ContractId} not found");
            }

            await ValidateProgressPermissionAsync(request.ContractId);

            // Validate period
            if (request.PeriodStart >= request.PeriodEnd)
            {
                throw new BadRequestException("Period start must be before period end");
            }

            // Check for period overlap
            var hasOverlap = await _progressRepo.AnyAsync(
                predicate: p => p.ContractId == request.ContractId &&
                               ((request.PeriodStart >= p.PeriodStart && request.PeriodStart < p.PeriodEnd) ||
                                (request.PeriodEnd > p.PeriodStart && request.PeriodEnd <= p.PeriodEnd) ||
                                (request.PeriodStart <= p.PeriodStart && request.PeriodEnd >= p.PeriodEnd)));

            if (hasOverlap)
            {
                throw new ConflictException("Period overlaps with existing progress record");
            }

            // Validate progress items
            if (request.ContractProgressItems == null || !request.ContractProgressItems.Any())
            {
                throw new BadRequestException("Progress items are required");
            }

            // Get all contract items for validation
            var contractItems = await _contractItemRepo.GetAllAsync(
                predicate: ci => ci.ContractId == request.ContractId,
                disableTracking: true);

            var contractItemMap = contractItems.ToDictionary(ci => ci.Id);

            // Validate all contract item IDs exist
            var invalidItems = request.ContractProgressItems
                .Where(pi => !contractItemMap.ContainsKey(pi.ContractItemId))
                .ToList();

            if (invalidItems.Any())
            {
                throw new BadRequestException($"Invalid contract items: {string.Join(", ", invalidItems.Select(i => i.ContractItemId))}");
            }

            await unitOfWork.BeginTransactionAsync();

            try
            {
                // Validate PaymentSchedule if provided
                if (request.PaymentScheduleId.HasValue)
                {
                    var schedule = await _scheduleRepo.GetFirstOrDefaultAsync(
                        predicate: s => s.Id == request.PaymentScheduleId.Value,
                        disableTracking: true);

                    if (schedule == null)
                    {
                        throw new BadRequestException("PaymentSchedule not found");
                    }

                    if (schedule.ContractId != request.ContractId)
                    {
                        throw new BadRequestException("PaymentSchedule không thuộc Contract này");
                    }
                }

                // Create progress record
                var progress = ContractProgress.Create(
                    request.ContractId,
                    request.PaymentScheduleId,
                    request.PeriodStart,
                    request.PeriodEnd);

                await _progressRepo.InsertAsync(progress);
                await unitOfWork.SaveChangesAsync();

                // Create progress items
                int itemsCount = 0;
                foreach (var itemRequest in request.ContractProgressItems)
                {
                    var contractItem = contractItemMap[itemRequest.ContractItemId];

                    if (itemRequest.ExecutedQuantity < 0)
                    {
                        continue;
                    }

                    // Check total executed quantity doesn't exceed contract quantity
                    var totalExecuted = await _progressItemRepo.GetAllAsync(
                        predicate: pi => pi.ContractItemId == itemRequest.ContractItemId,
                        disableTracking: true);

                    var currentTotal = totalExecuted.Sum(te => te.ExecutedQuantity);
                    if (currentTotal + itemRequest.ExecutedQuantity > contractItem.Quantity)
                    {
                        continue;
                    }

                    var progressItem = ContractProgressItem.Create(
                        progress.Id,
                        itemRequest.ContractItemId,
                        itemRequest.ExecutedQuantity,
                        contractItem.Price);

                    await _progressItemRepo.InsertAsync(progressItem);
                    itemsCount++;
                }

                await unitOfWork.SaveChangesAsync();
                await unitOfWork.CommitAsync();

                return new CreateContractProgressWithItemsResponse
                {
                    ProgressId = progress.Id,
                    ProgressItemsCount = itemsCount,
                    Success = true,
                    Message = $"Progress created successfully with {itemsCount} items"
                };
            }
            catch
            {
                await unitOfWork.RollbackAsync();
                throw;
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error creating contract progress with items");
            throw;
        }
    }

    public async Task<UpdateContractProgressWithItemsResponse> UpdateContractProgressWithItemsAsync(
        UpdateContractProgressWithItemsRequest request)
    {
        try
        {
            // Validate contract exists
            var contract = await _contractRepo.GetFirstOrDefaultAsync(
                predicate: c => c.Id == request.ContractId,
                disableTracking: true);

            if (contract == null)
            {
                throw new NotFoundException($"Contract with ID {request.ContractId} not found");
            }

            await ValidateProgressPermissionAsync(request.ContractId);

            // Validate period
            if (request.PeriodStart >= request.PeriodEnd)
            {
                throw new BadRequestException("Period start must be before period end");
            }

            // Validate progress items
            if (request.ContractProgressItems == null || !request.ContractProgressItems.Any())
            {
                throw new BadRequestException("Progress items are required");
            }

            // Get all contract items for validation
            var contractItems = await _contractItemRepo.GetAllAsync(
                predicate: ci => ci.ContractId == request.ContractId,
                disableTracking: true);

            var contractItemMap = contractItems.ToDictionary(ci => ci.Id);

            // Validate all contract item IDs exist
            var invalidItems = request.ContractProgressItems
                .Where(pi => !contractItemMap.ContainsKey(pi.ContractItemId))
                .ToList();

            if (invalidItems.Any())
            {
                throw new BadRequestException($"Invalid contract items: {string.Join(", ", invalidItems.Select(i => i.ContractItemId))}");
            }

            await unitOfWork.BeginTransactionAsync();

            try
            {
                if (!request.Id.HasValue || request.Id.Value == Guid.Empty)
                {
                    // ADD NEW
                    // Check for period overlap
                    var hasOverlap = await _progressRepo.AnyAsync(
                        predicate: p => p.ContractId == request.ContractId &&
                                       ((request.PeriodStart >= p.PeriodStart && request.PeriodStart < p.PeriodEnd) ||
                                        (request.PeriodEnd > p.PeriodStart && request.PeriodEnd <= p.PeriodEnd) ||
                                        (request.PeriodStart <= p.PeriodStart && request.PeriodEnd >= p.PeriodEnd)));

                    if (hasOverlap)
                    {
                        throw new ConflictException("Period overlaps with existing progress record");
                    }

                    // Validate PaymentSchedule if provided
                    if (request.PaymentScheduleId.HasValue)
                    {
                        var schedule = await _scheduleRepo.GetFirstOrDefaultAsync(
                            predicate: s => s.Id == request.PaymentScheduleId.Value,
                            disableTracking: true);

                        if (schedule == null)
                        {
                            throw new BadRequestException("PaymentSchedule not found");
                        }

                        if (schedule.ContractId != request.ContractId)
                        {
                            throw new BadRequestException("PaymentSchedule không thuộc Contract này");
                        }
                    }

                    var newProgress = ContractProgress.Create(
                        request.ContractId,
                        request.PaymentScheduleId,
                        request.PeriodStart,
                        request.PeriodEnd);

                    await _progressRepo.InsertAsync(newProgress);
                    await unitOfWork.SaveChangesAsync();

                    // Create progress items
                    int itemsCount = 0;
                    foreach (var itemRequest in request.ContractProgressItems)
                    {
                        var contractItem = contractItemMap[itemRequest.ContractItemId];

                        if (itemRequest.ExecutedQuantity < 0)
                        {
                            continue;
                        }

                        // Check total executed quantity doesn't exceed contract quantity
                        var totalExecuted = await _progressItemRepo.GetAllAsync(
                            predicate: pi => pi.ContractItemId == itemRequest.ContractItemId,
                            disableTracking: true);

                        var currentTotal = totalExecuted.Sum(te => te.ExecutedQuantity);
                        if (currentTotal + itemRequest.ExecutedQuantity > contractItem.Quantity)
                        {
                            continue;
                        }

                        var progressItem = ContractProgressItem.Create(
                            newProgress.Id,
                            itemRequest.ContractItemId,
                            itemRequest.ExecutedQuantity,
                            contractItem.Price);

                        await _progressItemRepo.InsertAsync(progressItem);
                        itemsCount++;
                    }

                    await unitOfWork.SaveChangesAsync();
                    await unitOfWork.CommitAsync();

                    return new UpdateContractProgressWithItemsResponse
                    {
                        ProgressId = newProgress.Id,
                        Operation = "Added",
                        ItemsAffected = itemsCount,
                        Success = true,
                        Message = $"Progress created successfully with {itemsCount} items"
                    };
                }
                else
                {
                    // UPDATE EXISTING
                    var existingProgress = await _progressRepo.GetFirstOrDefaultAsync(
                        predicate: p => p.Id == request.Id.Value,
                        include: p => p.Include(x => x.ProgressItems),
                        disableTracking: false);

                    if (existingProgress == null)
                    {
                        throw new NotFoundException($"Contract progress with ID {request.Id} not found");
                    }

                    // Verify it belongs to the requested contract
                    if (existingProgress.ContractId != request.ContractId)
                    {
                        throw new BadRequestException($"Progress does not belong to contract {request.ContractId}");
                    }

                    // Check overlap with other progress records (excluding current)
                    var hasOverlap = await _progressRepo.AnyAsync(
                        predicate: p => p.ContractId == request.ContractId &&
                                       p.Id != request.Id.Value &&
                                       ((request.PeriodStart >= p.PeriodStart && request.PeriodStart < p.PeriodEnd) ||
                                        (request.PeriodEnd > p.PeriodStart && request.PeriodEnd <= p.PeriodEnd) ||
                                        (request.PeriodStart <= p.PeriodStart && request.PeriodEnd >= p.PeriodEnd)));

                    if (hasOverlap)
                    {
                        throw new ConflictException("Period overlaps with existing progress record");
                    }

                    // Validate PaymentSchedule if provided
                    if (request.PaymentScheduleId.HasValue)
                    {
                        var schedule = await _scheduleRepo.GetFirstOrDefaultAsync(
                            predicate: s => s.Id == request.PaymentScheduleId.Value,
                            disableTracking: true);

                        if (schedule == null)
                        {
                            throw new BadRequestException("PaymentSchedule not found");
                        }

                        if (schedule.ContractId != request.ContractId)
                        {
                            throw new BadRequestException("PaymentSchedule không thuộc Contract này");
                        }
                    }

                    // Update progress period
                    existingProgress.Update(request.PaymentScheduleId, request.PeriodStart, request.PeriodEnd);
                    _progressRepo.Update(existingProgress);

                    // Get existing progress items
                    var existingItems = existingProgress.ProgressItems.ToList();
                    var requestItemIds = request.ContractProgressItems
                        .Where(i => i.Id.HasValue && i.Id.Value != Guid.Empty)
                        .Select(i => i.Id!.Value)
                        .ToHashSet();

                    // Delete items not in request
                    var itemsToDelete = existingItems
                        .Where(ei => !requestItemIds.Contains(ei.Id))
                        .ToList();

                    if (itemsToDelete.Any())
                    {
                        _progressItemRepo.Delete(itemsToDelete);
                    }

                    // Add or Update items
                    int itemsAffected = itemsToDelete.Count;
                    foreach (var itemRequest in request.ContractProgressItems)
                    {
                        if (!contractItemMap.TryGetValue(itemRequest.ContractItemId, out var contractItem))
                        {
                            continue;
                        }

                        if (!itemRequest.Id.HasValue || itemRequest.Id.Value == Guid.Empty)
                        {
                            // Add new item
                            var newItem = ContractProgressItem.Create(
                                request.Id.Value,
                                itemRequest.ContractItemId,
                                itemRequest.ExecutedQuantity,
                                contractItem.Price);

                            await _progressItemRepo.InsertAsync(newItem);
                            itemsAffected++;
                        }
                        else
                        {
                            // Update existing item
                            var existingItem = existingItems.FirstOrDefault(ei => ei.Id == itemRequest.Id.Value);
                            if (existingItem != null)
                            {
                                existingItem.Update(itemRequest.ExecutedQuantity, contractItem.Price);
                                _progressItemRepo.Update(existingItem);
                                itemsAffected++;
                            }
                        }
                    }

                    await unitOfWork.SaveChangesAsync();
                    await unitOfWork.CommitAsync();

                    return new UpdateContractProgressWithItemsResponse
                    {
                        ProgressId = existingProgress.Id,
                        Operation = "Updated",
                        ItemsAffected = itemsAffected,
                        Success = true,
                        Message = $"Progress updated successfully with {itemsAffected} items affected"
                    };
                }
            }
            catch
            {
                await unitOfWork.RollbackAsync();
                throw;
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error updating contract progress with items");
            throw;
        }
    }

    public async Task<ContractProgressGroupedSummaryDto> GetContractProgressGroupedSummaryAsync(Guid contractProgressId)
    {
        try
        {
            // Get the contract progress with all items
            var progress = await _progressRepo.GetFirstOrDefaultAsync(
                predicate: p => p.Id == contractProgressId,
                include: p => p.Include(x => x.ProgressItems)
                               .ThenInclude(pi => pi.ContractItem)
                               .ThenInclude(ci => ci.Material),
                disableTracking: true);

            if (progress == null)
            {
                throw new NotFoundException($"Contract progress with ID {contractProgressId} not found");
            }

            // Calculate total quantity and amount
            var totalQuantity = progress.ProgressItems.Sum(pi => pi.ExecutedQuantity);
            var totalAmount = progress.ProgressItems.Sum(pi => pi.ExecutedAmount);

            // Map items
            var items = progress.ProgressItems
                .OrderBy(pi => pi.ContractItem.Material.MaterialCode)
                .Select(pi => new ContractProgressItemSummaryDto
                {
                    Id = pi.Id,
                    ContractItemId = pi.ContractItemId,
                    MaterialCode = pi.ContractItem.Material.MaterialCode,
                    MaterialName = pi.ContractItem.Material.Name,
                    MaterialPrice = pi.ContractItem.Price,
                    ExecutedQuantity = pi.ExecutedQuantity,
                    ExecutedAmount = pi.ExecutedAmount
                }).ToList();

            return new ContractProgressGroupedSummaryDto
            {
                ContractProgressId = progress.Id,
                ContractId = progress.ContractId,
                PeriodStart = progress.PeriodStart,
                PeriodEnd = progress.PeriodEnd,
                TotalQuantity = totalQuantity,
                TotalAmount = totalAmount,
                Items = items
            };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting grouped summary for contract progress {ContractProgressId}", contractProgressId);
            throw;
        }
    }

    public async Task<ContractProgressItemDetailResponse> GetProgressItemByIdAsync(Guid id)
    {
        try
        {
            var progressItem = await _progressItemRepo.GetFirstOrDefaultAsync(
                predicate: pi => pi.Id == id,
                include: pi => pi.Include(x => x.ContractProgress)
                               .Include(x => x.ContractItem)
                               .ThenInclude(ci => ci.Material),
                disableTracking: true);

            if (progressItem == null)
            {
                throw new NotFoundException($"Contract progress item with ID {id} not found");
            }

            return new ContractProgressItemDetailResponse
            {
                Id = progressItem.Id,
                ContractProgressId = progressItem.ContractProgressId,
                ContractItemId = progressItem.ContractItemId,
                MaterialCode = progressItem.ContractItem.Material.MaterialCode ?? string.Empty,
                MaterialName = progressItem.ContractItem.Material.Name ?? string.Empty,
                MaterialPrice = progressItem.ContractItem.Price,
                ContractQuantity = progressItem.ContractItem.Quantity,
                ExecutedQuantity = progressItem.ExecutedQuantity,
                ExecutedAmount = progressItem.ExecutedAmount,
                PeriodStart = progressItem.ContractProgress.PeriodStart,
                PeriodEnd = progressItem.ContractProgress.PeriodEnd
            };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting progress item {Id}", id);
            throw;
        }
    }

    public async Task<UpdateSingleProgressItemResponse> UpdateProgressItemAsync(UpdateSingleProgressItemRequest request)
    {
        try
        {
            var progressItem = await _progressItemRepo.GetFirstOrDefaultAsync(
                predicate: pi => pi.Id == request.Id,
                include: pi => pi.Include(x => x.ContractItem!),
                disableTracking: false);

            if (progressItem == null)
            {
                throw new NotFoundException($"Contract progress item with ID {request.Id} not found");
            }

            await ValidateProgressPermissionAsync(progressItem.ContractItem.ContractId);

            // Validate executed quantity
            if (request.ExecutedQuantity < 0)
            {
                throw new BadRequestException("Executed quantity cannot be negative");
            }

            // Check total executed quantity doesn't exceed contract quantity
            var allProgressItems = await _progressItemRepo.GetAllAsync(
                predicate: pi => pi.ContractItemId == progressItem.ContractItemId && pi.Id != request.Id,
                disableTracking: true);

            decimal totalExecutedAcrossAllProgress = allProgressItems.Sum(pi => pi.ExecutedQuantity);
            
            if (totalExecutedAcrossAllProgress + request.ExecutedQuantity > progressItem.ContractItem.Quantity)
            {
                throw new BadRequestException(
                    $"Executed quantity exceeds contract quantity. " +
                    $"Total across all progress (excluding current): {totalExecutedAcrossAllProgress}, " +
                    $"Contract quantity: {progressItem.ContractItem.Quantity}");
            }

            await unitOfWork.BeginTransactionAsync();

            try
            {
                progressItem.Update(request.ExecutedQuantity, progressItem.ContractItem.Price);
                _progressItemRepo.Update(progressItem);
                await unitOfWork.SaveChangesAsync();
                await unitOfWork.CommitAsync();

                return new UpdateSingleProgressItemResponse
                {
                    Id = progressItem.Id,
                    ContractItemId = progressItem.ContractItemId,
                    ExecutedQuantity = progressItem.ExecutedQuantity,
                    ExecutedAmount = progressItem.ExecutedAmount,
                    Success = true,
                    Message = "Progress item updated successfully"
                };
            }
            catch
            {
                await unitOfWork.RollbackAsync();
                throw;
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error updating progress item {Id}", request.Id);
            throw;
        }
    }

    public async Task<DeleteContractProgressItemResponse> DeleteProgressItemAsync(Guid id)
    {
        try
        {
            var progressItem = await _progressItemRepo.GetFirstOrDefaultAsync(
                predicate: pi => pi.Id == id,
                include: pi => pi.Include(x => x.ContractItem),
                disableTracking: false);

            if (progressItem == null)
            {
                throw new NotFoundException($"Contract progress item with ID {id} not found");
            }

            await ValidateProgressPermissionAsync(progressItem.ContractItem.ContractId);

            await unitOfWork.BeginTransactionAsync();

            try
            {
                _progressItemRepo.Delete(progressItem);
                await unitOfWork.SaveChangesAsync();
                await unitOfWork.CommitAsync();

                return new DeleteContractProgressItemResponse
                {
                    Id = id,
                    Success = true,
                    Message = "Progress item deleted successfully"
                };
            }
            catch
            {
                await unitOfWork.RollbackAsync();
                throw;
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error deleting progress item {Id}", id);
            throw;
        }
    }
}
