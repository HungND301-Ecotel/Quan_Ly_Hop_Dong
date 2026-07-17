using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using Application.Dto.Catalog.ContractPayment;
using Application.Dto.Cloud.AWS;
using Application.Interfaces.Infrastructures.Integrates.Cloud.Service.AWS;
using Application.Interfaces.Services.Catalog;
using Azure;
using Domain.Common.Enums;
using Domain.Entities.Catalog;
using Domain.Entities.Catalog.PaymentSchedule;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Services.Catalog;

public class ContractPaymentService(
    IUnitOfWork unitOfWork,
    ICurrentUser currentUser,
    IAwsS3Service awsS3Service,
    ILogger<ContractPaymentService> logger) : IContractPaymentService
{
    private readonly IWriteRepository<ContractPayment> _paymentRepo = unitOfWork.GetRepository<ContractPayment>();
    private readonly IWriteRepository<Contract> _contractRepo = unitOfWork.GetRepository<Contract>();
    private readonly IWriteRepository<PaymentSchedule> _scheduleRepo = unitOfWork.GetRepository<PaymentSchedule>();
    private readonly IWriteRepository<ContractApprovalHistory> _contractApprovalHistoryRepo = unitOfWork.GetRepository<ContractApprovalHistory>();
    private readonly IWriteRepository<Domain.Entities.Identity.User> _userRepo = unitOfWork.GetRepository<Domain.Entities.Identity.User>();

    private async Task ValidatePaymentPermissionAsync(Guid contractId)
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

        var isAuthorized = contract.ContractUserRoles.Any(r => r.UserId == currentUserId && (
            r.Role == Domain.Common.Enums.ContractRole.Manager ||
            r.Role == Domain.Common.Enums.ContractRole.ReceivingOfficer));

        if (!isAuthorized)
        {
            throw new BadRequestException("Only the Direct Contract Manager or the Receiving Officer is allowed to update payments/documents.");
        }
    }

    public async Task<ContractPaymentResponseDto> GetByContractIdAsync(Guid contractId)
    {
        try
        {
            // Verify contract exists
            var contract = await _contractRepo.GetFirstOrDefaultAsync(
                predicate: c => c.Id == contractId,
                include: c => c.Include(x => x.ContractPayments)
                    .ThenInclude(cp => cp.Invoice)
                    .Include(x => x.ContractPayments)
                    .ThenInclude(cp => cp.Tax!),
                disableTracking: true);

            if (contract == null)
            {
                throw new NotFoundException($"Contract with ID {contractId} not found");
            }

            // Get all payments for the contract
            var payments = contract.ContractPayments
                .OrderBy(p => p.PeriodNumber)
                .Select(p => new ContractPaymentDto
                {
                    Id = p.Id,
                    ContractId = p.ContractId,
                    PaymentScheduleId = p.PaymentScheduleId,
                    PeriodNumber = p.PeriodNumber,
                    AcceptanceReportFilePaths = p.AcceptanceReportFilePaths,
                    InvoiceFilePaths = p.InvoiceFilePaths,
                    Invoice = p.Invoice == null
                        ? null
                        : new InvoiceDto
                        {
                            NumberInvoice = p.Invoice.NumberInvoice,
                            DateInvoice = p.Invoice.DateInvoice == DateTimeOffset.MinValue ? null : p.Invoice.DateInvoice
                        },
                    TaxFilePaths = p.TaxFilePaths,
                    Tax = p.Tax == null
                        ? null
                        : new TaxDto
                        {
                            DeclarationDate = p.Tax.DeclarationDate,
                            VatRate = p.Tax.VatRate,
                            TaxableRevenue = p.Tax.TaxableRevenue,
                            VatAmount = p.Tax.VatAmount,
                            TaxCode = p.Tax.TaxCode
                        },
                    PaymentDate = p.PaymentDate,
                    Amount = p.Amount
                }).ToList();

            var totalAmount = payments.Sum(p => p.Amount);

            var response = new ContractPaymentResponseDto
            {
                ContractId = contractId,
                TotalAmount = totalAmount,
                LiquidationFilePath = contract.LiquidationFilePath,
                Payments = payments
            };
            // Generate presigned URLs for S3 files
            var s3Tasks = new List<Task>();

            // Handle LiquidationFilePath
            if (!string.IsNullOrEmpty(response.LiquidationFilePath))
            {
                s3Tasks.Add(awsS3Service.GetPresignedDownloadUrl(response.LiquidationFilePath, BucketType.SourceDefault)
                    .ContinueWith(t => response.LiquidationFilePath = t.Result));
            }

            // Handle file paths in each payment
            foreach (var payment in response.Payments)
            {
                // AcceptanceReportFilePaths
                if (payment.AcceptanceReportFilePaths != null && payment.AcceptanceReportFilePaths.Any())
                {
                    for (int i = 0; i < payment.AcceptanceReportFilePaths.Length; i++)
                    {
                        var index = i; // Capture for closure
                        var filePath = payment.AcceptanceReportFilePaths[index];
                        if (!string.IsNullOrEmpty(filePath))
                        {
                            s3Tasks.Add(awsS3Service.GetPresignedDownloadUrl(filePath, BucketType.SourceDefault)
                                .ContinueWith(t => payment.AcceptanceReportFilePaths[index] = t.Result));
                        }
                    }
                }

                // InvoiceFilePaths
                if (payment.InvoiceFilePaths != null && payment.InvoiceFilePaths.Any())
                {
                    for (int i = 0; i < payment.InvoiceFilePaths.Length; i++)
                    {
                        var index = i; // Capture for closure
                        var filePath = payment.InvoiceFilePaths[index];
                        if (!string.IsNullOrEmpty(filePath))
                        {
                            s3Tasks.Add(awsS3Service.GetPresignedDownloadUrl(filePath, BucketType.SourceDefault)
                                .ContinueWith(t => payment.InvoiceFilePaths[index] = t.Result));
                        }
                    }
                }

                // TaxFilePaths
                if (payment.TaxFilePaths != null && payment.TaxFilePaths.Any())
                {
                    for (int i = 0; i < payment.TaxFilePaths.Length; i++)
                    {
                        var index = i; // Capture for closure
                        var filePath = payment.TaxFilePaths[index];
                        if (!string.IsNullOrEmpty(filePath))
                        {
                            s3Tasks.Add(awsS3Service.GetPresignedDownloadUrl(filePath, BucketType.SourceDefault)
                                .ContinueWith(t => payment.TaxFilePaths[index] = t.Result));
                        }
                    }
                }
            }

            if (s3Tasks.Any())
            {
                await Task.WhenAll(s3Tasks);
            }

            return response;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting contract payments for contract {ContractId}", contractId);
            throw;
        }
    }

    public async Task<UpdateContractPaymentBatchResponse> UpdateBatchAsync(UpdateContractPaymentBatchRequest request)
    {
        try
        {
            // Validate contract exists
            var contract = await _contractRepo.GetFirstOrDefaultAsync(
                predicate: c => c.Id == request.ContractId,
                include: c => c.Include(x => x.ContractPayments)
                    .ThenInclude(cp => cp.Invoice)
                    .Include(x => x.ContractPayments)
                    .ThenInclude(cp => cp.Tax!)
                    .Include(x => x.ContractUserRoles),
                disableTracking: false);

            if (contract == null)
            {
                throw new NotFoundException($"Contract with ID {request.ContractId} not found");
            }

            await ValidatePaymentPermissionAsync(request.ContractId);

            var currentUserId = currentUser.UserId;
            var user = await _userRepo.FindAsync(currentUserId);
            var isAdmin = user?.Role == Domain.Common.Enums.UserRole.Admin;
            if (!isAdmin)
            {
                var isManager = contract.ContractUserRoles.Any(r => r.UserId == currentUserId && r.Role == Domain.Common.Enums.ContractRole.Manager);
                if (!isManager)
                {
                    throw new BadRequestException("Only the Direct Contract Manager is allowed to update payments and acceptance reports.");
                }
            }

            var results = new List<UpdateContractPaymentBatchResult>();
            var addedCount = 0;
            var updatedCount = 0;
            var deletedCount = 0;
            var failedCount = 0;

            await unitOfWork.BeginTransactionAsync();

            try
            {
                // Get existing payments from DB
                var existingPayments = contract.ContractPayments.ToList();

                var schedules = await _scheduleRepo.GetAllAsync(
                    predicate: s => s.ContractId == request.ContractId,
                    disableTracking: false);
                var schedule = schedules.FirstOrDefault();
                if (schedule == null)
                {
                    schedule = new PaymentSchedule(request.ContractId, 30, 0, Domain.Common.Enums.ValueType.Amount);
                    await _scheduleRepo.InsertAsync(schedule);
                    await unitOfWork.SaveChangesAsync();
                }
                var scheduleId = schedule.Id;

                // Process request items (Add or Update dựa theo Id hoặc PeriodNumber)
                foreach (var itemRequest in request.Items)
                {
                    try
                    {
                        ContractPayment? existingPayment = null;

                        if (itemRequest.Id.HasValue && itemRequest.Id.Value != Guid.Empty)
                        {
                            existingPayment = existingPayments.FirstOrDefault(ep => ep.Id == itemRequest.Id.Value);
                        }
                        else
                        {
                            existingPayment = existingPayments.FirstOrDefault(ep => ep.PeriodNumber == itemRequest.PeriodNumber);
                        }

                        // Determine Add or Update dựa trên existingPayment
                        if (existingPayment == null)
                        {
                            // ADD NEW
                            if (existingPayments.Any(ep => ep.PeriodNumber == itemRequest.PeriodNumber))
                            {
                                results.Add(new UpdateContractPaymentBatchResult
                                {
                                    Id = null,
                                    Operation = "Add Failed",
                                    Success = false,
                                    Message = $"Period number {itemRequest.PeriodNumber} already exists"
                                });
                                failedCount++;
                                continue;
                            }

                            var newPayment = ContractPayment.Create(
                                request.ContractId,
                                scheduleId,
                                itemRequest.PeriodNumber,
                                itemRequest.PaymentDate,
                                itemRequest.Amount,
                                itemRequest.AcceptanceReportFilePaths,
                                itemRequest.InvoiceFilePaths,
                                itemRequest.TaxFilePaths,
                                itemRequest.Invoice?.NumberInvoice,
                                itemRequest.Invoice?.DateInvoice,
                                itemRequest.Tax?.DeclarationDate,
                                itemRequest.Tax?.VatRate,
                                itemRequest.Tax?.TaxableRevenue,
                                itemRequest.Tax?.VatAmount,
                                itemRequest.Tax?.TaxCode);

                            await _paymentRepo.InsertAsync(newPayment);
                            existingPayments.Add(newPayment);

                            results.Add(new UpdateContractPaymentBatchResult
                            {
                                Id = newPayment.Id,
                                Operation = "Added",
                                Success = true,
                                Message = "Payment added successfully"
                            });
                            addedCount++;
                        }
                        else
                        {
                            // UPDATE EXISTING
                            var otherPayments = existingPayments
                                .Where(ep => ep.Id != existingPayment.Id)
                                .ToList();

                            if (otherPayments.Any(ep => ep.PeriodNumber == itemRequest.PeriodNumber))
                            {
                                results.Add(new UpdateContractPaymentBatchResult
                                {
                                    Id = existingPayment.Id,
                                    Operation = "Update Failed",
                                    Success = false,
                                    Message = $"Period number {itemRequest.PeriodNumber} already exists"
                                });
                                failedCount++;
                                continue;
                            }

                            existingPayment.Update(
                                scheduleId,
                                itemRequest.PeriodNumber,
                                itemRequest.PaymentDate,
                                itemRequest.Amount,
                                itemRequest.AcceptanceReportFilePaths,
                                itemRequest.InvoiceFilePaths,
                                itemRequest.TaxFilePaths,
                                itemRequest.Invoice?.NumberInvoice,
                                itemRequest.Invoice?.DateInvoice,
                                itemRequest.Tax?.DeclarationDate,
                                itemRequest.Tax?.VatRate,
                                itemRequest.Tax?.TaxableRevenue,
                                itemRequest.Tax?.VatAmount,
                                itemRequest.Tax?.TaxCode);

                            results.Add(new UpdateContractPaymentBatchResult
                            {
                                Id = existingPayment.Id,
                                Operation = "Updated",
                                Success = true,
                                Message = "Payment updated successfully"
                            });
                            updatedCount++;
                        }
                    }
                    catch (Exception ex)
                    {
                        logger.LogError(ex, "Error processing payment item");
                        results.Add(new UpdateContractPaymentBatchResult
                        {
                            Id = null,
                            Operation = "Failed",
                            Success = false,
                            Message = $"Error: {ex.Message}"
                        });
                        failedCount++;
                    }
                }
                await unitOfWork.SaveChangesAsync();
                // Update contract status based on uploaded files
                await UpdateContractStatusBasedOnPaymentFiles(contract);

                await unitOfWork.SaveChangesAsync();
                await unitOfWork.CommitAsync();

                return new UpdateContractPaymentBatchResponse
                {
                    AddedCount = addedCount,
                    UpdatedCount = updatedCount,
                    DeletedCount = deletedCount,
                    FailedCount = failedCount,
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
            logger.LogError(ex, "Error in batch update contract payments");
            throw;
        }
    }

    public async Task UpdateLiquidationFileAsync(UpdateLiquidationFileRequest request)
    {
        try
        {
            var contract = await _contractRepo.GetFirstOrDefaultAsync(
                predicate: c => c.Id == request.ContractId,
                include: c => c.Include(x => x.ContractUserRoles),
                disableTracking: false);

            if (contract == null)
            {
                throw new NotFoundException($"Contract with ID {request.ContractId} not found");
            }

            await ValidatePaymentPermissionAsync(request.ContractId);

            var currentUserId = currentUser.UserId;
            var user = await _userRepo.FindAsync(currentUserId);
            var isAdmin = user?.Role == Domain.Common.Enums.UserRole.Admin;
            if (!isAdmin)
            {
                var isManager = contract.ContractUserRoles.Any(r => r.UserId == currentUserId && r.Role == Domain.Common.Enums.ContractRole.Manager);
                if (!isManager)
                {
                    throw new BadRequestException("Only the Direct Contract Manager is allowed to update the contract liquidation file.");
                }
            }

            await unitOfWork.BeginTransactionAsync();

            try
            {
                contract.SetLiquidationFilePath(request.LiquidationFilePath);
                
                // Tự động chuyển trạng thái khi có file thanh lý
                if (!string.IsNullOrWhiteSpace(request.LiquidationFilePath))
                {
                    // Lưu old status và old substatus trước khi thay đổi
                    var oldStatus = contract.Status;
                    var oldSubStatus = contract.SubStatus;
                    
                    // Chuyển sang trạng thái Liquidated - LiquidatedDone
                    contract.SetStatus(ContractStatus.Liquidated);
                    contract.SetSubStatus(ContractSubStatus.LiquidatedDone);
                    
                    // Tạo approval history record
                    var history = ContractApprovalHistory.Create(
                        contract.Id,
                        currentUser.UserId,
                        null,
                        oldStatus.ToString(),
                        ContractStatus.Liquidated.ToString(),
                        oldSubStatus?.ToString() ?? "None",
                        ContractSubStatus.LiquidatedDone.ToString(),
                        null,
                        $"Contract liquidation file uploaded. Liquidation file path: {request.LiquidationFilePath}"
                    );
                    await _contractApprovalHistoryRepo.InsertAsync(history);
                    
                    logger.LogInformation(
                        "Updated contract {ContractId} status to Liquidated-LiquidatedDone after uploading liquidation file",
                        contract.Id);
                }
                
                _contractRepo.Update(contract);
                
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
            logger.LogError(ex, "Error updating liquidation file for contract {ContractId}", request.ContractId);
            throw;
        }
    }

    public async Task<UploadPaymentFileResponse> UploadFileAsync(IFormFile file, UploadPaymentFileRequest request)
    {
        try
        {
            if (file == null || file.Length == 0)
            {
                throw new BadRequestException("File is required");
            }

            // Validate contract exists
            var contract = await _contractRepo.GetFirstOrDefaultAsync(
                predicate: c => c.Id == request.ContractId,
                include: c => c.Include(x => x.ContractUserRoles),
                disableTracking: true);

            if (contract == null)
            {
                throw new NotFoundException($"Contract with ID {request.ContractId} not found");
            }

            await ValidatePaymentPermissionAsync(request.ContractId);

            var currentUserId = currentUser.UserId;
            var user = await _userRepo.FindAsync(currentUserId);
            var isAdmin = user?.Role == Domain.Common.Enums.UserRole.Admin;

            if (!isAdmin)
            {
                var isManager = contract.ContractUserRoles.Any(r => r.UserId == currentUserId && r.Role == Domain.Common.Enums.ContractRole.Manager);
                var isReceiving = contract.ContractUserRoles.Any(r => r.UserId == currentUserId && r.Role == Domain.Common.Enums.ContractRole.ReceivingOfficer);

                if (request.FileType == PaymentFileType.AcceptanceReport || request.FileType == PaymentFileType.Liquidation)
                {
                    if (!isManager)
                    {
                        throw new BadRequestException("Only the Direct Contract Manager is allowed to upload acceptance reports or liquidation files.");
                    }
                }
                else if (request.FileType == PaymentFileType.Invoice || request.FileType == PaymentFileType.Tax)
                {
                    if (!isReceiving)
                    {
                        throw new BadRequestException("Only the Receiving Officer is allowed to upload invoices or tax files.");
                    }
                }
            }

            // Validate file extension
            var allowedExtensions = new[] { ".pdf", ".doc", ".docx", ".png", ".jpg", ".jpeg" };
            var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();

            if (!allowedExtensions.Contains(fileExtension))
            {
                throw new BadRequestException($"File type {fileExtension} is not allowed. Allowed types: {string.Join(", ", allowedExtensions)}");
            }

            // Determine folder based on file type
            string folderPath = request.FileType switch
            {
                PaymentFileType.AcceptanceReport => $"contracts/{contract.ContractNumber}/payments/acceptance-reports",
                PaymentFileType.Invoice => $"contracts/{contract.ContractNumber}/payments/invoices",
                PaymentFileType.Tax => $"contracts/{contract.ContractNumber}/payments/taxes",
                PaymentFileType.Liquidation => $"contracts/{contract.ContractNumber}/payments/liquidation",
                _ => throw new BadRequestException("Invalid file type")
            };

            // Upload file
            var inputModel = new AwsInputModel
            {
                FileId = Guid.NewGuid(),
                FileName = file.FileName,
                BucketType = Application.Dto.Cloud.AWS.BucketType.SourceDefault,
                Module = $"{folderPath}",
                ContentType = file.ContentType,
                IsExpires = true
            };
            var result = await awsS3Service.UploadFileAsync(file, inputModel);

            logger.LogInformation("Uploaded {FileType} file for contract {ContractId}: {FilePath}",
                request.FileType, request.ContractId, result);

            return new UploadPaymentFileResponse
            {
                FilePath = result?.FullPath ?? "",
                FileName = file.FileName,
                FileSize = file.Length,
                FileType = request.FileType
            };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error uploading {FileType} file for contract {ContractId}",
                request.FileType, request.ContractId);
            throw;
        }
    }

    /// <summary>
    /// Update contract status based on payment files uploaded
    /// Logic:
    /// 1. If all payment schedules have all required files (AcceptanceReport + Invoice + Tax):
    ///    - If IsAutoLiquidated = true → Status = Liquidated, SubStatus = LiquidatedDone
    ///    - If IsAutoLiquidated = false → SubStatus = PendingLiquidation
    /// 2. Else if AcceptanceReport files exist → InAcceptance
    /// 3. Else if Invoice or Tax files exist → InPayment
    /// </summary>
    // Bỏ hoàn toàn param request, chỉ đọc từ DB sau khi đã save
    private async Task UpdateContractStatusBasedOnPaymentFiles(Contract contract)
    {
        if (contract.Status != ContractStatus.Active)
        {
            return;
        }

        var allPayments = await _paymentRepo.GetAllAsync(
            predicate: cp => cp.ContractId == contract.Id,
            include: cp => cp.Include(x => x.Invoice).Include(x => x.Tax!),
            disableTracking: true);

        if (!allPayments.Any())
        {
            return;
        }

        bool allPaymentsComplete = allPayments.All(p =>
            p.AcceptanceReportFilePaths?.Length > 0 &&
            ((p.InvoiceFilePaths?.Length > 0) || p.Invoice != null) &&
            ((p.TaxFilePaths?.Length > 0) || p.Tax != null));

        ContractSubStatus? newSubStatus = null;
        ContractStatus? newStatus = null;

        if (allPaymentsComplete)
        {
            if (contract.IsAutoLiquidated)
            {
                newStatus = ContractStatus.Liquidated;
                newSubStatus = ContractSubStatus.AutoLiquidated;
            }
            else
            {
                newSubStatus = ContractSubStatus.PendingLiquidation;
            }
        }
        else
        {
            var hasAnyAcceptanceReport = allPayments.Any(p =>
                p.AcceptanceReportFilePaths?.Length > 0);

            var hasAnyInvoiceOrTax = allPayments.Any(p =>
                p.InvoiceFilePaths?.Length > 0 || p.Invoice != null || p.TaxFilePaths?.Length > 0 || p.Tax != null);

            if (hasAnyAcceptanceReport)
            {
                newSubStatus = ContractSubStatus.InAcceptance;
            }
            else if (hasAnyInvoiceOrTax)
            {
                newSubStatus = ContractSubStatus.InPayment;
            }
        }

        if (newStatus.HasValue && contract.Status != newStatus.Value)
        {
            contract.SetStatus(newStatus.Value);
        }

        if (newSubStatus.HasValue && contract.SubStatus != newSubStatus.Value)
        {
            contract.SetSubStatus(newSubStatus.Value);
            _contractRepo.Update(contract);
        }
    }
}

