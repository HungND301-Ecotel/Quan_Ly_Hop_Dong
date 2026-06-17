using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using Application.Dto.Catalog;
using Application.Dto.Cloud.AWS;
using Application.Interfaces.Infrastructures.Integrates.Cloud.Service.AWS;
using Application.Interfaces.Services.Catalog;
using Domain.Common.Enums;
using Domain.Entities.Catalog;
using Domain.Entities.Catalog.PaymentSchedule;
using Domain.Entities.Category;
using Domain.Entities.Identity;
using Mapster;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Shared.Constants;
using Contract = Domain.Entities.Catalog.Contract;
using User = Domain.Entities.Identity.User;

namespace Infrastructure.Services.Catalog;

public partial class ContractService(
    IUnitOfWork unitOfWork,
    ICurrentUser currentUser,
    IConfiguration configuration,
    INotificationService notificationService,
    IHttpClientFactory httpClientFactory,
    IFileStorageService fileStorageService,
    IAwsS3Service awsS3Service,
    ILogger<ContractService> logger) : IContractService, IDigitalSignatureService
{
    private readonly IWriteRepository<Contract> _contractRepo = unitOfWork.GetRepository<Contract>();
    private readonly IWriteRepository<SigningHistory> _signingHistoryRepo = unitOfWork.GetRepository<SigningHistory>();
    private readonly IWriteRepository<ContractType> _contractTypeRepo = unitOfWork.GetRepository<ContractType>();
    private readonly IWriteRepository<Partner> _partnerRepo = unitOfWork.GetRepository<Partner>();
    private readonly IWriteRepository<Department> _departmentRepo = unitOfWork.GetRepository<Department>();
    private readonly IWriteRepository<User> _userRepo = unitOfWork.GetRepository<User>();
    private readonly IWriteRepository<ContractSigningFlow> _contractSigningFlowRepo = unitOfWork.GetRepository<ContractSigningFlow>();
    private readonly IWriteRepository<ContractApprovalHistory> _contractApprovalHistoryRepo = unitOfWork.GetRepository<ContractApprovalHistory>();
    private readonly IWriteRepository<ContractAttachment> _contractAttachmentRepo = unitOfWork.GetRepository<ContractAttachment>();
    private readonly IWriteRepository<ContractEditHistory> _contractEditHistoryRepo = unitOfWork.GetRepository<ContractEditHistory>();
    private readonly IWriteRepository<UserSignature> _userSignatureRepo = unitOfWork.GetRepository<UserSignature>();
    private readonly IWriteRepository<PaymentSchedule> _paymentScheduleRepo = unitOfWork.GetRepository<PaymentSchedule>();
    private readonly IWriteRepository<ContractUserRole> _contractUserRoleRepo = unitOfWork.GetRepository<ContractUserRole>();
    private readonly IWriteRepository<ContractItem> _contractItemRepo = unitOfWork.GetRepository<ContractItem>();
    private readonly IWriteRepository<Material> _materialRepo = unitOfWork.GetRepository<Material>();
    private readonly IWriteRepository<ContractGuarantee> _contractGuaranteeRepo = unitOfWork.GetRepository<ContractGuarantee>();
    private readonly IWriteRepository<NotificationConfig> _notificationConfigRepo = unitOfWork.GetRepository<NotificationConfig>();
    private readonly IWriteRepository<ContractRelationship> _contractRelationshipRepo = unitOfWork.GetRepository<ContractRelationship>();
    private readonly IWriteRepository<Level1Code> _Level1CodeRepo = unitOfWork.GetRepository<Level1Code>();
    private readonly IWriteRepository<Level2Code> _level2CodeRepo = unitOfWork.GetRepository<Level2Code>();
    private readonly IWriteRepository<Level3Code> _level3CodeRepo = unitOfWork.GetRepository<Level3Code>();
    private readonly IWriteRepository<ContractStructureCatalog> _contractStructureCatalogRepo = unitOfWork.GetRepository<ContractStructureCatalog>();
    private readonly IWriteRepository<SignedContent> _signedContentRepo = unitOfWork.GetRepository<SignedContent>();

    private const decimal MIN_WIDTH = 80;
    private const decimal MIN_HEIGHT = 40;
    private const decimal DEFAULT_WIDTH = 150;
    private const decimal DEFAULT_HEIGHT = 50;

    public async Task<bool> ApproveContractAsync(ApproveContractDto dto)
    {
        var currentFlow = await _contractSigningFlowRepo.GetFirstOrDefaultAsync(
                predicate: p => p.ContractId == dto.ContractId && p.UserId == currentUser.UserId,
                include: p => p.Include(p => p.Contract),
                disableTracking: false)
                ?? throw new ConflictException("You are not in the signing flow");

        var contract = currentFlow?.Contract;

        if (currentFlow == null)
        {
            throw new ConflictException("You are not in the signing flow");
        }

        if (currentFlow.Status == SigningFlowStatus.Signed)
        {
            throw new ConflictException("You have already signed this contract");
        }

        var previousFlows = await _contractSigningFlowRepo.GetAllAsync(
            predicate: x => x.ContractId == dto.ContractId &&
                            x.SequenceOrder < currentFlow.SequenceOrder
                            && x.Id != currentFlow.Id,
            orderBy: o => o.OrderBy(o => o.SequenceOrder),
            disableTracking: true);

        if (previousFlows.Any(x => x.Status != SigningFlowStatus.Signed))
        {
            throw new ConflictException("Previous signers have not completed signing");
        }

        var oldStatus = contract.Status;
        var oldSubStatus = contract.SubStatus;
        await unitOfWork.BeginTransactionAsync();
        try
        {
            switch (dto.Action)
            {
                case ContractAction.Approve:

                    if (!currentFlow.CheckFlowPosition() && dto.SigningFlowPositions == null)
                    {
                        throw new ConflictException("Please provide flow position before approve");
                    }
                    else if (dto.SigningFlowPositions != null)
                    {
                        currentFlow.UpdatePosition(dto.SigningFlowPositions.PositionX, dto.SigningFlowPositions.PositionY, dto.SigningFlowPositions.PageNumber, dto.SigningFlowPositions.Width, dto.SigningFlowPositions.Height);
                    }

                    var signResult = await SignContractAsync(
                        currentFlow,
                        dto.SignatureId,
                        dto.CertificateUuid,
                        dto.Pin,
                        currentUser.UserId
                    );

                    if (!signResult.Success)
                    {
                        throw new BadRequestException(signResult.Message);
                    }

                    await notificationService.NotifyContractSignedAsync(contract.Id, currentUser.UserId);

                    var allFlows = await _contractSigningFlowRepo.GetAllAsync(
                        predicate: x => x.ContractId == dto.ContractId,
                        disableTracking: true);

                    if (allFlows.All(x => x.Status == SigningFlowStatus.Signed))
                    {
                        contract.SetStatus(ContractStatus.PendingApproval);
                        contract.SetSubStatus(ContractSubStatus.WaitPartnerSign);
                    }
                    else
                    {
                        contract.SetStatus(ContractStatus.PendingApproval);
                        contract.SetSubStatus(ContractSubStatus.AwaitingSigning);

                        var nextFlow = allFlows
                            .Where(x => x.Status == SigningFlowStatus.Pending)
                            .OrderBy(x => x.SequenceOrder)
                            .FirstOrDefault();

                        if (nextFlow != null)
                        {
                            await notificationService.NotifyNextSignerAsync(contract.Id, nextFlow.UserId);
                        }
                    }
                    break;

                case ContractAction.Reject:
                    currentFlow.SetStatus(SigningFlowStatus.Rejected);
                    currentFlow.SetRejectionReason(dto.RejectionReason);
                    contract.SetStatus(ContractStatus.Draft);
                    contract.SetSubStatus(ContractSubStatus.SavedDraft);

                    // Lưu history
                    var rejectHistory = ContractApprovalHistory.Create(
                        contract.Id, 
                        currentUser.UserId, 
                        dto.Action, 
                        oldStatus.ToString(), 
                        contract.Status.ToString(), 
                        oldSubStatus.ToString(), 
                        contract.SubStatus.ToString(), 
                        currentFlow.SignatureType, 
                        dto.RejectionReason ?? dto.Comment);
                    await _contractApprovalHistoryRepo.InsertAsync(rejectHistory);

                    _contractRepo.Update(contract);

                    if (contract.CreatedBy != Guid.Empty)
                    {
                        await notificationService.NotifyContractRejectedAsync(contract.Id, contract.CreatedBy);
                    }
                    break;

                default:
                    throw new BadRequestException("Invalid action");
            }

            // Reject case đã tự xử lý update và history
            if (dto.Action != ContractAction.Reject)
            {
                _contractSigningFlowRepo.Update(currentFlow);
                _contractRepo.Update(contract);

                var history = ContractApprovalHistory.Create(contract.Id, currentUser.UserId, dto.Action, oldStatus.ToString(), contract.Status.ToString(), oldSubStatus.ToString(), contract.SubStatus.ToString(), currentFlow.SignatureType, dto.Comment);
                await _contractApprovalHistoryRepo.InsertAsync(history);
            }

            await unitOfWork.SaveChangesAsync();
            await unitOfWork.CommitAsync();

            return true;
        }
        catch
        {
            await unitOfWork.RollbackAsync();
            throw;
        }
    }

    public async Task<bool> SubmitForApprovalAsync(Guid contractId)
    {
        var contract = await _contractRepo.GetFirstOrDefaultAsync(
            predicate: c => c.Id == contractId,
            include: c => c.Include(x => x.ContractSigningFlows),
            disableTracking: false)
            ?? throw new NotFoundException("Contract not found");

        // Validation: Chỉ Draft mới được submit
        if (contract.Status != ContractStatus.Draft &&
            contract.Status != ContractStatus.PendingApproval)
        {
            throw new BadRequestException($"Only draft contracts can be submitted for approval. Current status: {contract.Status}");
        }

        // Validation: Phải có signing flows
        if (!contract.ContractSigningFlows.Any())
        {
            throw new BadRequestException("Contract must have at least one signing flow before submitting for approval");
        }

        var oldStatus = contract.Status;
        var oldSubStatus = contract.SubStatus;

        await unitOfWork.BeginTransactionAsync();
        try
        {
            // Chuyển trạng thái sang PendingApproval/AwaitingSigning
            contract.SetStatus(ContractStatus.PendingApproval);
            contract.SetSubStatus(ContractSubStatus.AwaitingSigning);

            _contractRepo.Update(contract);

            // Lưu history
            var history = ContractApprovalHistory.Create(
                contract.Id, 
                currentUser.UserId, 
                ContractAction.SubmittedForApproval, 
                oldStatus.ToString(), 
                contract.Status.ToString(), 
                oldSubStatus?.ToString(), 
                contract.SubStatus?.ToString(), 
                null, 
                "Contract submitted for approval");

            await _contractApprovalHistoryRepo.InsertAsync(history);

            await unitOfWork.SaveChangesAsync();
            await unitOfWork.CommitAsync();

            // Gửi thông báo cho người ký đầu tiên
            var firstSigner = contract.ContractSigningFlows
                .OrderBy(f => f.SequenceOrder)
                .FirstOrDefault();

            if (firstSigner != null)
            {
                _ = Task.Run(async () =>
                {
                    try
                    {
                        await notificationService.NotifyContractCreatedAsync(contract.Id, firstSigner.UserId);
                    }
                    catch (Exception ex)
                    {
                        logger.LogError(ex, "Failed to send notification for contract {ContractId}", contract.Id);
                    }
                });
            }

            return true;
        }
        catch
        {
            await unitOfWork.RollbackAsync();
            throw;
        }
    }

    public async Task<bool> ActivateContractAsync(ActivateContractDto dto)
    {
        // Lấy hợp đồng
        var contract = await _contractRepo.GetFirstOrDefaultAsync(
            predicate: c => c.Id == dto.ContractId,
            disableTracking: false)
            ?? throw new NotFoundException("Contract not found");

        // Validate: chỉ hợp đồng có SubStatus = WaitPartnerSign mới được chuyển sang Active
        if (contract.SubStatus != ContractSubStatus.WaitPartnerSign)
        {
            throw new BadRequestException("Only contracts with status 'WaitPartnerSign' can be activated. Current SubStatus: " + contract.SubStatus);
        }

        // Validate status từ request
        if (dto.Status != ContractStatus.Active)
        {
            throw new BadRequestException("Invalid status transition. Expected Status: Active");
        }

        // Validate contractFilePath là bắt buộc
        if (string.IsNullOrWhiteSpace(dto.ContractFilePath))
        {
            throw new BadRequestException("ContractFilePath is required");
        }

        var oldStatus = contract.Status;
        var oldSubStatus = contract.SubStatus;
        var targetSubStatus = contract.StartDate.Date > DateTimeOffset.UtcNow.Date
            ? ContractSubStatus.NotStarted
            : ContractSubStatus.InProgress;

        await unitOfWork.BeginTransactionAsync();
        try
        {
            // Chuyển trạng thái
            contract.SetStatus(ContractStatus.Active);
            contract.SetSubStatus(targetSubStatus);

            // Cập nhật đường dẫn file hợp đồng đã ký
            contract.SetSignedFilePath(dto.ContractFilePath);

            _contractRepo.Update(contract);

            // Lưu lịch sử chuyển trạng thái
            var history = ContractApprovalHistory.Create(
                contract.Id,
                currentUser.UserId,
                null, // Không có action cụ thể (không phải Approve/Reject)
                oldStatus.ToString(),
                contract.Status.ToString(),
                oldSubStatus.ToString(),
                contract.SubStatus.ToString(),
                null, // Không có signature type
                $"Activated contract from WaitPartnerSign to {targetSubStatus}"
            );
            await _contractApprovalHistoryRepo.InsertAsync(history);

            await unitOfWork.SaveChangesAsync();
            await unitOfWork.CommitAsync();

            return true;
        }
        catch
        {
            await unitOfWork.RollbackAsync();
            throw;
        }
    }

    public async Task<bool> PauseContractAsync(Guid contractId, string? reason)
    {
        // Lấy hợp đồng
        var contract = await _contractRepo.GetFirstOrDefaultAsync(
            predicate: c => c.Id == contractId,
            disableTracking: false)
            ?? throw new NotFoundException("Contract not found");

        // Validate: chỉ hợp đồng đang Active với SubStatus = InProgress hoặc InPayment hoặc InAcceptance mới có thể tạm dừng
        if (contract.Status != ContractStatus.Active)
        {
            throw new BadRequestException($"Only contracts with status 'Active' can be paused. Current Status: {contract.Status}");
        }

        if (contract.SubStatus != ContractSubStatus.InProgress &&
            contract.SubStatus != ContractSubStatus.InPayment &&
            contract.SubStatus != ContractSubStatus.InAcceptance &&
            contract.SubStatus != ContractSubStatus.NearExpiry)
        {
            throw new BadRequestException($"Only contracts with SubStatus 'InProgress', 'InPayment', or 'InAcceptance' can be paused. Current SubStatus: {contract.SubStatus}");
        }

        var oldSubStatus = contract.SubStatus;

        await unitOfWork.BeginTransactionAsync();
        try
        {
            // Chuyển trạng thái sang Paused
            contract.SetSubStatus(ContractSubStatus.Paused);

            _contractRepo.Update(contract);

            // Lưu lịch sử chuyển trạng thái
            var history = ContractApprovalHistory.Create(
                contract.Id,
                currentUser.UserId,
                null,
                contract.Status.ToString(),
                contract.Status.ToString(),
                oldSubStatus.ToString(),
                ContractSubStatus.Paused.ToString(),
                null,
                $"Paused contract. Reason: {reason ?? "No reason provided"}"
            );
            await _contractApprovalHistoryRepo.InsertAsync(history);

            await unitOfWork.SaveChangesAsync();
            await unitOfWork.CommitAsync();

            return true;
        }
        catch
        {
            await unitOfWork.RollbackAsync();
            throw;
        }
    }

    public async Task<bool> ResumeContractAsync(Guid contractId, string? reason)
    {
        // Lấy hợp đồng
        var contract = await _contractRepo.GetFirstOrDefaultAsync(
            predicate: c => c.Id == contractId,
            disableTracking: false)
            ?? throw new NotFoundException("Contract not found");

        // Validate: chỉ hợp đồng đang Paused mới có thể tiếp tục
        if (contract.Status != ContractStatus.Active)
        {
            throw new BadRequestException($"Only contracts with status 'Active' can be resumed. Current Status: {contract.Status}");
        }

        if (contract.SubStatus != ContractSubStatus.Paused)
        {
            throw new BadRequestException($"Only contracts with SubStatus 'Paused' can be resumed. Current SubStatus: {contract.SubStatus}");
        }

        var oldSubStatus = contract.SubStatus;

        await unitOfWork.BeginTransactionAsync();
        try
        {
            // Chuyển trạng thái sang InProgress
            contract.SetSubStatus(ContractSubStatus.InProgress);

            _contractRepo.Update(contract);

            // Lưu lịch sử chuyển trạng thái
            var history = ContractApprovalHistory.Create(
                contract.Id,
                currentUser.UserId,
                null,
                contract.Status.ToString(),
                contract.Status.ToString(),
                oldSubStatus.ToString(),
                ContractSubStatus.InProgress.ToString(),
                null,
                $"Resumed contract. Reason: {reason ?? "No reason provided"}"
            );
            await _contractApprovalHistoryRepo.InsertAsync(history);

            await unitOfWork.SaveChangesAsync();
            await unitOfWork.CommitAsync();

            return true;
        }
        catch
        {
            await unitOfWork.RollbackAsync();
            throw;
        }
    }

    public async Task<bool> CancelContractAsync(Guid contractId, string? reason)
    {
        // Lấy hợp đồng
        var contract = await _contractRepo.GetFirstOrDefaultAsync(
            predicate: c => c.Id == contractId,
            disableTracking: false)
            ?? throw new NotFoundException("Contract not found");

        // Không cho phép hủy hợp đồng đã hủy hoặc đã thanh lý
        if (contract.Status == ContractStatus.Liquidated)
        {
            throw new BadRequestException($"Contract already liquidated with SubStatus: {contract.SubStatus}");
        }

        if (contract.Status == ContractStatus.Cancelled)
        {
            throw new BadRequestException($"Contract already cancelled with SubStatus: {contract.SubStatus}");
        }

        // Không cho phép hủy hợp đồng đã hết hạn
        if (contract.Status == ContractStatus.Expired)
        {
            throw new BadRequestException("Cannot cancel an expired contract. Current Status: Expired");
        }

        // Không cho phép hủy hợp đồng đã lưu trữ
        if (contract.Status == ContractStatus.Archive)
        {
            throw new BadRequestException("Cannot cancel an archived contract");
        }

        var oldStatus = contract.Status;
        var oldSubStatus = contract.SubStatus;
        ContractSubStatus newSubStatus;

        // Xác định SubStatus mới dựa trên trạng thái hiện tại
        if (contract.Status != ContractStatus.Active)
        {
            // Chưa có hiệu lực → Hủy trước hiệu lực
            newSubStatus = ContractSubStatus.CancelledBeforeEffective;
        }
        else
        {
            // Đang có hiệu lực → Hủy khi đang hiệu lực
            newSubStatus = ContractSubStatus.TerminatedEarly;
        }

        await unitOfWork.BeginTransactionAsync();
        try
        {
            // Chuyển trạng thái sang Cancelled
            contract.SetStatus(ContractStatus.Cancelled);
            contract.SetSubStatus(newSubStatus);

            _contractRepo.Update(contract);

            // Lưu lịch sử chuyển trạng thái
            var history = ContractApprovalHistory.Create(
                contract.Id,
                currentUser.UserId,
                null,
                oldStatus.ToString(),
                ContractStatus.Cancelled.ToString(),
                oldSubStatus?.ToString() ?? "None",
                newSubStatus.ToString(),
                null,
                $"Cancelled contract ({newSubStatus}). Reason: {reason ?? "No reason provided"}"
            );
            await _contractApprovalHistoryRepo.InsertAsync(history);

            await unitOfWork.SaveChangesAsync();
            await unitOfWork.CommitAsync();

            return true;
        }
        catch
        {
            await unitOfWork.RollbackAsync();
            throw;
        }
    }

    public async Task<bool> UpdateToLiquidationAsync(Guid contractId, string? reason)
    {
        // Lấy hợp đồng
        var contract = await _contractRepo.GetFirstOrDefaultAsync(
            predicate: c => c.Id == contractId,
            disableTracking: false)
            ?? throw new NotFoundException("Contract not found");

        // Validate: chỉ hợp đồng đang Active hoặc Expired mới có thể chuyển sang thanh lý
        if (contract.Status != ContractStatus.Active && 
            contract.Status != ContractStatus.Expired)
        {
            throw new BadRequestException($"Only contracts with status 'Active' or 'Expired' can be updated to pending liquidation. Current Status: {contract.Status}");
        }

        // Không cho phép thanh lý hợp đồng đã hủy
        if (contract.Status == ContractStatus.Cancelled)
        {
            throw new BadRequestException($"Cannot update a cancelled contract with SubStatus: {contract.SubStatus}");
        }

        // Không cho phép thanh lý hợp đồng đã thanh lý xong
        if (contract.SubStatus == ContractSubStatus.LiquidatedDone)
        {
            throw new BadRequestException($"Contract already completed liquidation");
        }

        var oldStatus = contract.Status;
        var oldSubStatus = contract.SubStatus;

        await unitOfWork.BeginTransactionAsync();
        try
        {
            // Chuyển trạng thái sang Active với chờ thanh lý
            contract.SetStatus(ContractStatus.Active);
            contract.SetSubStatus(ContractSubStatus.PendingLiquidation);

            _contractRepo.Update(contract);

            // Lưu lịch sử chuyển trạng thái
            var history = ContractApprovalHistory.Create(
                contract.Id,
                currentUser.UserId,
                null,
                oldStatus.ToString(),
                ContractStatus.Liquidated.ToString(),
                oldSubStatus?.ToString() ?? "None",
                ContractSubStatus.PendingLiquidation.ToString(),
                null,
                $"Updated contract to pending liquidation. Reason: {reason ?? "No reason provided"}"
            );
            await _contractApprovalHistoryRepo.InsertAsync(history);

            await unitOfWork.SaveChangesAsync();
            await unitOfWork.CommitAsync();

            return true;
        }
        catch
        {
            await unitOfWork.RollbackAsync();
            throw;
        }
    }

    public async Task<bool> ArchiveContractAsync(Guid contractId)
    {
        // Lấy hợp đồng
        var contract = await _contractRepo.GetFirstOrDefaultAsync(
            predicate: c => c.Id == contractId,
            disableTracking: false)
            ?? throw new NotFoundException("Contract not found");

        // Chỉ cho phép lưu trữ hợp đồng đã hoàn thành/thanh lý/hủy/hết hạn
        if (contract.Status != ContractStatus.Liquidated && 
            contract.Status != ContractStatus.Cancelled &&
            contract.Status != ContractStatus.Expired &&
            contract.Status != ContractStatus.Active)
        {
            throw new BadRequestException($"Only contracts with status 'Liquidated','Cancelled','Active' or 'Expired' can be archived. Current Status: {contract.Status}");
        }

        // Không cho phép lưu trữ hợp đồng đã lưu trữ
        if (contract.Status == ContractStatus.Archive)
        {
            throw new BadRequestException("Contract is already archived");
        }

        var oldStatus = contract.Status;
        var oldSubStatus = contract.SubStatus;
        var archiveSubStatus = oldStatus switch
        {
            ContractStatus.Liquidated => ContractSubStatus.ArchivedAfterLiquidation,
            ContractStatus.Cancelled => ContractSubStatus.ArchivedAfterCancellation,
            _ => oldSubStatus
        };

        await unitOfWork.BeginTransactionAsync();
        try
        {
            // Chuyển trạng thái sang Archive
            contract.SetStatus(ContractStatus.Archive);
            contract.SetSubStatus(archiveSubStatus);

            _contractRepo.Update(contract);

            // Lưu lịch sử chuyển trạng thái
            var history = ContractApprovalHistory.Create(
                contract.Id,
                currentUser.UserId,
                null,
                oldStatus.ToString(),
                ContractStatus.Archive.ToString(),
                oldSubStatus?.ToString() ?? "None",
                archiveSubStatus?.ToString() ?? "None",
                null,
                "Archived contract for long-term storage"
            );
            await _contractApprovalHistoryRepo.InsertAsync(history);

            await unitOfWork.SaveChangesAsync();
            await unitOfWork.CommitAsync();

            return true;
        }
        catch
        {
            await unitOfWork.RollbackAsync();
            throw;
        }
    }

    public async Task<PrepareExtensionDto> PrepareContractExtensionAsync(Guid contractId)
    {
        // Lấy hợp đồng cần gia hạn
        var contract = await _contractRepo.GetFirstOrDefaultAsync(
            predicate: c => c.Id == contractId,
            include: c => c
                .Include(x => x.ContractItems)
                .Include(x => x.ContractStructureCatalog),
            disableTracking: true)
            ?? throw new NotFoundException("Contract not found");

        // Kiểm tra điều kiện cho phép gia hạn
        // Chỉ hợp đồng Active hoặc Expired mới được gia hạn
        if (contract.Status != ContractStatus.Active && 
            contract.Status != ContractStatus.Expired)
        {
            throw new BadRequestException($"Only contracts with status 'Active' or 'Expired' can be extended. Current Status: {contract.Status}");
        }

        // Đếm số phụ lục hiện có để suggest số phụ lục tiếp theo
        int extensionCount = await _contractRelationshipRepo.CountAsync(
            predicate: r => r.ParentContractId == contractId && r.RelationType == ParentContractRelationType.RenewalContract);
        
        string suggestedAppendixNumber = $"GH{(extensionCount + 1):D2}"; // GH01, GH02, GH03...

        // Chuẩn bị DTO với dữ liệu từ hợp đồng cũ để prefill form
        var dto = new PrepareExtensionDto
        {
            OriginalContractId = contract.Id,
            OriginalContractNumber = contract.ContractNumber,
            SuggestedAppendixNumber = suggestedAppendixNumber,
            
            // Copy thông tin cơ bản - user có thể sửa
            IsDebtTrackingEnabled = contract.IsDebtTrackingEnabled,
            IsAutoLiquidated = contract.IsAutoLiquidated,
            Level1CodeId = contract.Level1CodeId,
            Level2CodeId = contract.Level2CodeId,
            Level3CodeId = contract.Level3CodeId,
            ContractStructureId = contract.ContractStructureId,
            ContractStructureName = contract.ContractStructureCatalog?.Name ?? string.Empty,
            ProcurementMethodId = contract.ProcurementMethodId,
            ContractTypeId = contract.ContractTypeId,
            ContractFieldId = contract.ContractFieldId,
            ContractFieldName = contract.ContractField?.Name,
            ContractRegisterId = contract.ContractRegisterId,
            ContractFormat = contract.ContractFormat,
            PartnerId = contract.PartnerId,
            DepartmentId = contract.DepartmentId,
            ContractValue = contract.ContractValue,
            VatPercentage = contract.VatPercentage,
            VatAmount = contract.VatAmount,
            ContractValueAfterVat = contract.ContractValueAfterVat,
            
            // Ngày cũ - chỉ để tham khảo, user phải chọn ngày mới
            OriginalStartDate = contract.StartDate,
            OriginalEndDate = contract.EndDate,
            
            Notes = contract.Notes,
            DiscountType = contract.DiscountType,
            DiscountValue = contract.DiscountValue,
            
            // Copy contract items (chỉ có MaterialId và Quantity)
            // Giá sẽ được lấy từ bảng Material khi tạo hợp đồng
            ContractItems = contract.ContractItems
                .Select(item => new CreateContractItemDto
                {
                    MaterialId = item.MaterialId,
                    Quantity = item.Quantity
                })
                .ToList()
        };

        return dto;
    }

    public async Task<bool> CreateAsync(CreateContractDto dto)
    {
        if (await _contractRepo.AnyAsync(x => x.ContractNumber == dto.ContractNumber))
        {
            throw new ConflictException("Contract number already exists");
        }

        await ValidateReferencesAsync(dto);

        // Lấy ContractTypeId từ Level1Code (1-1 relationship) nếu Level1CodeId có giá trị
        Guid autoContractTypeId = Guid.Empty;
        if (dto.Level1CodeId.HasValue)
        {
            var level1Code = await _Level1CodeRepo.FindAsync(dto.Level1CodeId.Value);
            if (level1Code != null)
            {
                autoContractTypeId = level1Code.ContractTypeId;
            }
        }

        if (dto.Level3CodeId.HasValue)
        {
            var level3Code = await _level3CodeRepo.FindAsync(dto.Level3CodeId.Value);
            if (level3Code == null)
            {
                throw new NotFoundException("Level3Code not found");
            }
        }

        await unitOfWork.BeginTransactionAsync();
        try
        {
            var isEconomicContract = dto.ContractFormat == ContractFormat.EconomicBuy || dto.ContractFormat == ContractFormat.EconomicSell;

            var entity = Contract.Create(
                isDebtTrackingEndable: dto.IsDebtTrackingEnabled,
                isAutoLiquidated: dto.IsAutoLiquidated,
                contractTypeId: autoContractTypeId,
                contractFieldId: dto.ContractFieldId,
                partnerId: dto.PartnerId,
                departmentId: dto.DepartmentId,
                contractValue: dto.ContractValue,
                startDate: dto.StartDate,
                endDate: dto.EndDate,
                filePath: dto.ContractFilePath,
                notes: dto.Notes,
                contractFormat: dto.ContractFormat,
                level1CodeId: dto.Level1CodeId,
                level2CodeId: dto.Level2CodeId,
                level3CodeId: dto.Level3CodeId,
                contractStructureId: dto.ContractStructureId,
                contractNumber: dto.ContractNumber,
                appendixNumber: dto.AppendixNumber,
                procurementMethodId: dto.ProcurementMethodId,
                contractRegisterId: dto.ContractRegisterId,
                discountType: dto.DiscountType,
                discountValue: dto.DiscountValue,
                vatPercentage: dto.VatPercentage,
                scheduleType: isEconomicContract ? dto.PaymentSchedules?.ScheduleType : null
            );

            if (!dto.IsDebtTrackingEnabled)
            {
                entity.SetStatus(ContractStatus.Archive);
                entity.SetSubStatus(null);
            }
            else if (dto.SigningFlows == null || !dto.SigningFlows.Any())
            {
                // Không có luồng ký → tự động Active
                var targetSubStatus = entity.StartDate.Date > DateTimeOffset.UtcNow.Date
                    ? ContractSubStatus.NotStarted
                    : ContractSubStatus.InProgress;

                entity.SetStatus(ContractStatus.Active);
                entity.SetSubStatus(targetSubStatus);
            }
            // Nếu có SigningFlows → giữ mặc định Draft/SavedDraft, chờ Submit

            entity.AddContractUserRoles(dto.ContractUserRoles.ToDomain(Guid.Empty));

            if (isEconomicContract)
            {
                if (dto.PaymentSchedules != null && dto.PaymentSchedules.Schedules != null && dto.PaymentSchedules.Schedules.Any())
                {
                    var paymentSchedule = dto.PaymentSchedules.Schedules
                        .Select(p => p.ToDomain(Guid.Empty, dto.PaymentSchedules.ScheduleType)).ToList();
                    entity.AddPaymentSchedules(paymentSchedule);
                }
            }

            var materialIds = dto.ContractItems.Select(c => c.MaterialId).Distinct();
            var materialMap = (await _materialRepo.GetAllAsync(predicate: m => materialIds.Contains(m.Id))).ToDictionary(m => m.Id, m => m.Price);
            var contractItems = dto.ContractItems
                .Select(p =>
                {
                    if (materialMap.TryGetValue(p.MaterialId, out var mPrice))
                    {
                        return ContractItem.Create(p.MaterialId, p.Quantity, mPrice ?? 0);
                    }
                    else
                    {
                        return null;
                    }
                }).Where(c => c != null).ToList();
            entity.AddContractItem(contractItems);

            if (isEconomicContract && dto.ContractGuarantee != null)
            {
                if (dto.ContractGuarantee.PerformanceBondGuarantee != null)
                {
                    var guaranteeDto = dto.ContractGuarantee.PerformanceBondGuarantee;
                    entity.AddContractGuarantee(ContractGuarantee.Create(GuaranteeType.PerformanceBond, guaranteeDto.Value, guaranteeDto.ValueType, guaranteeDto.DurationDate, guaranteeDto.BankAccountId));
                }

                if (dto.ContractGuarantee.WarrantyBondGuarantee != null)
                {
                    var guaranteeDto = dto.ContractGuarantee.WarrantyBondGuarantee;
                    entity.AddContractGuarantee(ContractGuarantee.Create(GuaranteeType.WarrantyBond, guaranteeDto.Value, guaranteeDto.ValueType, guaranteeDto.DurationDate, guaranteeDto.BankAccountId));
                }

                if (dto.ContractGuarantee.DepositGuarantee != null)
                {
                    var guaranteeDto = dto.ContractGuarantee.DepositGuarantee;
                    entity.AddContractGuarantee(ContractGuarantee.Create(GuaranteeType.Deposit, guaranteeDto.Value, guaranteeDto.ValueType, guaranteeDto.DurationDate, guaranteeDto.BankAccountId));
                }
            }

            if (!string.IsNullOrEmpty(dto.ContractFilePath))
            {
                entity.SetFilePath(dto.ContractFilePath);
            }

            await _contractRepo.InsertAsync(entity);
            await unitOfWork.SaveChangesAsync();

            var signedContentId = await ResolveSignedContentIdForLevel3CodeAsync(dto.Level3CodeId);
            entity.SetSignedContentId(signedContentId);
            await unitOfWork.SaveChangesAsync();

            if (dto.SigningFlows != null)
            {
                var flows = dto.SigningFlows
                    .Select(flowDto =>
                    {
                        var flow = flowDto.Adapt<ContractSigningFlow>();
                        flow.Update(entity.Id, SigningFlowStatus.Pending);
                        return flow;
                    })
                    .ToList();

                await _contractSigningFlowRepo.InsertAsync(flows);
            }

            if (dto.AttachmentFiles.Any())
            {
                var attachments = dto.AttachmentFiles
                    .Select(att => ContractAttachment.Create(
                        entity.Id,
                        att.FileName,
                        att.FilePath,
                        att.FileSize,
                        Path.GetExtension(att.FileName),
                        ""))
                    .ToList();
                await _contractAttachmentRepo.InsertAsync(attachments);
            }

            //insert history
            var history = ContractApprovalHistory.Create(entity.Id, currentUser.UserId, ContractAction.Created, "Draft");
            await _contractApprovalHistoryRepo.InsertAsync(history);

            await unitOfWork.SaveChangesAsync();

            // Tạo quan hệ cha-con nếu có ParentRelationship (contract này là con)
            if (dto.ParentRelationship != null && dto.ParentRelationship.ParentContractId != Guid.Empty)
            {
                var parentContract = await _contractRepo.FindAsync(dto.ParentRelationship.ParentContractId)
                    ?? throw new NotFoundException("Parent contract not found");
                if (parentContract != null)
                {
                    var relationship = ContractRelationship.Create(
                        dto.ParentRelationship.ParentContractId,
                        parentContract.ContractFormat,
                        entity.Id,
                        entity.ContractFormat,
                        dto.ParentRelationship.RelationType,
                        null);
                    await _contractRelationshipRepo.InsertAsync(relationship);
                    await unitOfWork.SaveChangesAsync();
                }
            }

            // Tạo quan hệ cha-con nếu có ChildRelationships (contract này là cha)
            if (dto.ChildRelationships != null && dto.ChildRelationships.Any())
            {
                var childContractIds = dto.ChildRelationships.Select(c => c.ChildContractId).Distinct();
                var childContracts = await _contractRepo.GetAllAsync(
                    predicate: c => childContractIds.Contains(c.Id),
                    disableTracking: false);

                var childContractMap = childContracts.ToDictionary(c => c.Id, c => c);

                foreach (var childRelationship in dto.ChildRelationships)
                {
                    if (!childContractMap.TryGetValue(childRelationship.ChildContractId, out var childContract))
                    {
                        throw new NotFoundException($"Child contract with ID {childRelationship.ChildContractId} not found");
                    }

                    var relationship = ContractRelationship.Create(
                        entity.Id,
                        entity.ContractFormat,
                        childRelationship.ChildContractId,
                        childContract.ContractFormat,
                        childRelationship.RelationType,
                        null);

                    await _contractRelationshipRepo.InsertAsync(relationship);
                }

                await unitOfWork.SaveChangesAsync();
            }

            await unitOfWork.CommitAsync();

            // Notification sẽ được gửi khi gọi SubmitForApprovalAsync

            return true;
        }
        catch
        {
            await unitOfWork.RollbackAsync();
            throw;
        }
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var entity = await _contractRepo.FindAsync(id);
        if (entity == null)
        {
            throw new NotFoundException("Contract not found");
        }

        if (entity.Status == ContractStatus.Archive)
        {
            throw new BadRequestException("Cannot delete an archived contract");
        }

        if (entity.Status != ContractStatus.Draft)
        {
            throw new ConflictException("Only draft contracts can be deleted");
        }

        _contractRepo.Delete(entity);
        await unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(IList<Guid> DeleteIds)
    {
        var distinctIds = DeleteIds.Distinct().ToList();

        if (distinctIds.Count != DeleteIds.Count)
        {
            throw new ConflictException(CustomResponseMessage.DeletedIdDuplicated);
        }

        if (!distinctIds.Any())
        {
            throw new BadRequestException(CustomResponseMessage.DeletedIdsEmpty);
        }

        var itemsToDelete = await _contractRepo.GetAllAsync(
            predicate: x => distinctIds.Contains(x.Id),
            disableTracking: true);

        if (itemsToDelete == null || !itemsToDelete.Any())
        {
            throw new NotFoundException(CustomResponseMessage.EntityNotFound);
        }

        if (itemsToDelete.Count != distinctIds.Count)
        {
            throw new NotFoundException(CustomResponseMessage.EntityNotFound);
        }

        // Không cho phép xóa hợp đồng đã lưu trữ
        var archivedContracts = itemsToDelete.Where(c => c.Status == ContractStatus.Archive).ToList();
        if (archivedContracts.Any())
        {
            throw new BadRequestException($"Cannot delete archived contracts. Found {archivedContracts.Count} archived contract(s)");
        }

        await unitOfWork.BeginTransactionAsync();

        try
        {
            _contractRepo.Delete(itemsToDelete);
            await unitOfWork.SaveChangesAsync();
            await unitOfWork.CommitAsync();

            return true;
        }
        catch (Exception)
        {
            await unitOfWork.RollbackAsync();
            throw;
        }
    }

    public async Task<List<ShortContractDto>> GetAllAsync(string? search, Guid? contractTypeId, Guid? departmentId, Guid? partnerId, ContractStatus? status, DateTime? startDate, DateTime? endDate, IList<ContractFormat>? formats, bool? IsArchiveContract, bool? isDebtTrackingEnabled)
    {
        return await GetContractsAsync(search, contractTypeId, departmentId, partnerId, status, startDate, endDate, formats, IsArchiveContract, isDebtTrackingEnabled, false);
    }

    public async Task<List<ShortContractDto>> GetMyVisibleContractsAsync(string? search, Guid? contractTypeId, Guid? departmentId, Guid? partnerId, ContractStatus? status, DateTime? startDate, DateTime? endDate, IList<ContractFormat>? formats, bool? IsArchiveContract, bool? isDebtTrackingEnabled)
    {
        return await GetContractsAsync(search, contractTypeId, departmentId, partnerId, status, startDate, endDate, formats, IsArchiveContract, isDebtTrackingEnabled, true);
    }

    private async Task<List<ShortContractDto>> GetContractsAsync(
        string? search,
        Guid? contractTypeId,
        Guid? departmentId,
        Guid? partnerId,
        ContractStatus? status,
        DateTime? startDate,
        DateTime? endDate,
        IList<ContractFormat>? formats,
        bool? isArchiveContract,
        bool? isDebtTrackingEnabled,
        bool onlyCurrentUserVisible)
    {
        var currentUserId = currentUser.UserId;

        var query = _contractRepo.GetAll().AsNoTracking()
                .Include(x => x.ContractType)
            .Include(x => x.ContractStructureCatalog)
                .Include(x => x.Level1Code)
            .Include(x => x.Level2Code)
            .Include(x => x.Level3Code)
            .Include(x => x.SignedContent)
                .Include(x => x.Partner)
                .Include(x => x.Department)
                .Include(x => x.ContractSigningFlows).ThenInclude(x => x.User).ThenInclude(x => x.UserDepartments).ThenInclude(x => x.Department)
                .Include(x => x.ContractUserRoles).ThenInclude(x => x.User).ThenInclude(x => x.UserDepartments).ThenInclude(x => x.Department)
                .Include(x => x.ContractItems)
                .Include(x => x.ProcurementMethod)
                .Include(x => x.ContractRegister)
                .Include(x => x.ContractField)
                .Where(x => (x.IsDebtTrackingEnabled == isDebtTrackingEnabled || isDebtTrackingEnabled == null));

        if (onlyCurrentUserVisible)
        {
            var user = await _userRepo.FindAsync(currentUserId);
            var isAdmin = user?.Role == UserRole.Admin;

            if (!isAdmin)
            {
                query = query.Where(x => x.CreatedBy == currentUserId
                                    || x.ContractUserRoles.Any(r => r.UserId == currentUserId && (
                                        r.Role == ContractRole.Coordinator ||
                                        r.Role == ContractRole.DraftingOfficer ||
                                        r.Role == ContractRole.ReceivingOfficer ||
                                        (r.Role == ContractRole.Manager &&
                                         x.Status != ContractStatus.Draft &&
                                         x.Status != ContractStatus.PendingApproval &&
                                         x.Status != ContractStatus.RequiresRevision)
                                    )));
            }
        }

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(x => x.ContractNumber.Contains(search));
        }

        if (contractTypeId != null)
        {
            query = query.Where(x => x.ContractTypeId == contractTypeId.Value);
        }

        if (departmentId.HasValue)
        {
            query = query.Where(x => x.DepartmentId == departmentId.Value);
        }

        if (partnerId.HasValue)
        {
            query = query.Where(x => x.PartnerId == partnerId.Value);
        }

        if (status != null)
        {
            query = query.Where(x => x.Status == status);
        }

        if (startDate.HasValue)
        {
            query = query.Where(x => x.StartDate >= startDate.Value);
        }

        if (endDate.HasValue)
        {
            query = query.Where(x => x.EndDate <= endDate.Value);
        }

        if (formats != null && formats.Any())
        {
            query = query.Where(x => formats.Contains(x.ContractFormat));
        }

        if (isArchiveContract.HasValue)
        {
            query = query.Where(x => (x.Status == ContractStatus.Archive) == isArchiveContract.Value);
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(x => x.CreatedOn)
            .ToListAsync();

        var signingFlowMap = items.ToDictionary(x => x.Id, x => x.ContractSigningFlows);
        var contractUserRoleMap = items.ToDictionary(x => x.Id, x => x.ContractUserRoles);

        var result = items.Adapt<List<ShortContractDto>>();
        var itemMap = items.ToDictionary(i => i.Id, i => i);

        foreach (var item in result)
        {
            if (itemMap.TryGetValue(item.Id, out var contract))
            {
                item.Level1CodeCode = contract.Level1Code?.Code;
                item.Level2CodeId = contract.Level2CodeId;
                item.Level2Code = contract.Level2Code?.Code;
                item.Level3Code = contract.Level3Code?.Code;
                item.ContractFieldName = contract.ContractField?.Name;
                item.ContractStructureName = contract.ContractStructureCatalog?.Name ?? string.Empty;
                item.Title = contract.SignedContent?.Title;
                item.IsArchiveContract = contract.Status == ContractStatus.Archive;
            }

            if (signingFlowMap.TryGetValue(item.Id, out var flows))
            {
                item.SigningFlows = flows.Select(f => new ContractSigningFlowDto
                {
                    Id = f.Id,
                    ContractId = f.ContractId,
                    Height = f.Height,
                    PageNumber = f.PageNumber,
                    PositionX = f.PositionX,
                    PositionY = f.PositionY,
                    RejectionReason = f.RejectionReason,
                    RevisionNotes = f.RevisionNotes,
                    SequenceOrder = f.SequenceOrder,
                    SignatureType = f.SignatureType,
                    SignedAt = f.SignedAt,
                    Status = f.Status.ToString(),
                    Width = f.Width,
                    UserId = f.UserId,
                    UserName = f.User.UserName,
                    FullName = f.User.Fullname,
                    Role = f.User.Role,
                    DepartmentId = f.User.UserDepartments.FirstOrDefault().DepartmentId,
                    DepartmentName = f.User.UserDepartments.FirstOrDefault().Department.Name,
                }).ToList();
            }

            if (contractUserRoleMap.TryGetValue(item.Id, out var roles))
            {
                item.ContractUserRoles = roles.Select(r => new ContractUserRoleDto
                {
                    Id = r.Id,
                    ContractId = r.ContractId,
                    DepartmentId = r.User.UserDepartments.FirstOrDefault().DepartmentId,
                    DepartmentName = r.User.UserDepartments.FirstOrDefault().Department.Name,
                    Fullname = r.User.Fullname,
                    UserId = r.UserId,
                    Role = r.Role,
                    UserRole = r.User.Role
                }).ToList();
            }
        }

        return result;
    }

    public async Task<List<ContractApprovalHistoryDto>> GetApprovalHistoryAsync(Guid contractId)
    {
        var contract = await _contractRepo.FindAsync(contractId);
        if (contract == null)
        {
            throw new NotFoundException("Contract not found");
        }

        var history = await _contractApprovalHistoryRepo.GetAllAsync(
            predicate: x => x.ContractId == contractId,
            include: h => h.Include(x => x.User).ThenInclude(x => x.Position),
            orderBy: h => h.OrderBy(x => x.CreatedOn),
            disableTracking: true
            );

        var dtos = history.Select(h => new ContractApprovalHistoryDto
        {
            Id = h.Id,
            ContractId = h.ContractId,
            UserId = h.UserId,
            UserName = h.User.UserName,
            FullName = h.User.Fullname,
            Role = h.User.Role,
            PositionId = h.User.PositionId,
            PositionName = h.User.Position?.Name ?? "",
            Action = h.Action,
            FromStatus = h.FromStatus,
            ToStatus = h.ToStatus,
            SignatureType = h.SignatureType,
            Comment = h.Comment,
            CreatedOn = h.CreatedOn
        }).ToList();

        return dtos;
    }

    public async Task<ContractDto> GetByIdAsync(Guid id)
    {
        var query = await _contractRepo.GetAll().AsNoTracking()
            .Include(x => x.ContractType)
            .Include(x => x.ContractStructureCatalog)
            .Include(x => x.Level1Code)
            .Include(x => x.Level2Code)
            .Include(x => x.Level3Code)
            .Include(x => x.SignedContent)
            .Include(x => x.Partner)
            .Include(x => x.AsChildRelationships).ThenInclude(r => r.ParentContract).ThenInclude(l => l.SignedContent)
            .Include(x => x.AsParentRelationships).ThenInclude(r => r.ChildContract).ThenInclude(l => l.SignedContent)
            .Include(x => x.Department)
            .Include(x => x.ContractUserRoles).ThenInclude(x => x.User).ThenInclude(u => u.UserDepartments).ThenInclude(ud => ud.Department)
            .Include(x => x.PaymentSchedules)
            .Include(x => x.ContractItems).ThenInclude(x => x.Material)
            .Include(x => x.ContractGuarantees).ThenInclude(x => x.BankAccount)
            .Include(x => x.ProcurementMethod)
            .Include(x => x.ContractRegister)
            .Include(x => x.ContractField)
            .FirstOrDefaultAsync(x => x.Id == id && x.DeletedOn == null)
            ?? throw new NotFoundException("Contract not found");

        var currentUserEntity = await _userRepo.FindAsync(currentUser.UserId);
        var isAdmin = currentUserEntity?.Role == UserRole.Admin;
        if (!isAdmin && query.CreatedBy != currentUser.UserId)
        {
            var userRoles = query.ContractUserRoles.Where(r => r.UserId == currentUser.UserId).ToList();
            var hasManagerRole = userRoles.Any(r => r.Role == ContractRole.Manager);
            var hasCoordinatorRole = userRoles.Any(r => r.Role == ContractRole.Coordinator);
            var hasDraftingOfficerRole = userRoles.Any(r => r.Role == ContractRole.DraftingOfficer);
            var hasReceivingOfficerRole = userRoles.Any(r => r.Role == ContractRole.ReceivingOfficer);

            if (hasManagerRole && !hasCoordinatorRole && !hasDraftingOfficerRole && !hasReceivingOfficerRole)
            {
                if (query.Status == ContractStatus.Draft ||
                    query.Status == ContractStatus.PendingApproval ||
                    query.Status == ContractStatus.RequiresRevision)
                {
                    throw new BadRequestException("As the Direct Contract Manager, you can only view this contract after drafting and approval are completed.");
                }
            }
        }

        var dto = query.Adapt<ContractDto>();

        dto.Title = query.SignedContent?.Title;
        dto.Level1CodeCode = query.Level1Code?.Code;
        dto.Level2CodeId = query.Level2CodeId;
        dto.Level2Code = query.Level2Code?.Code;
        dto.Level3Code = query.Level3Code?.Code;
        dto.ContractFieldName = query.ContractField?.Name;
        dto.ContractStructureName = query.ContractStructureCatalog?.Name ?? string.Empty;
        dto.PartnerDetail = query.Partner?.Adapt<PartnerDto>();
        
        // Ưu tiên quan hệ liên kết với hợp đồng nguyên tắc; fallback quan hệ đầu tiên nếu không có.
        var parentRelationship = query.AsChildRelationships
            .FirstOrDefault(r => r.RelationType == ParentContractRelationType.LinkedContract)
            ?? query.AsChildRelationships.FirstOrDefault();
        dto.ParentContractId = parentRelationship?.ParentContractId;
        dto.ParentContractTitle = parentRelationship?.ParentContract?.SignedContent?.Title;
        dto.ParentContractNumber = parentRelationship?.ParentContract?.ContractNumber;

        dto.ChildContractRelationships = query.AsParentRelationships
            .Where(r => r.ChildContract != null)
            .Select(r => new ChildContractRelationshipDto
            {
                ChildContractId = r.ChildContractId,
                ChildContractTitle = r.ChildContract.SignedContent?.Title,
                ChildContractNumber = r.ChildContract.ContractNumber,
                ChildContractFormat = r.ChildContract.ContractFormat,
                RelationType = r.RelationType
            })
            .ToList();

        var isEconomicContract = dto.ContractFormat == ContractFormat.EconomicBuy || dto.ContractFormat == ContractFormat.EconomicSell;
        var paymentScheduleMap = query.PaymentSchedules.ToDictionary(p => p.Id, p => p);
        if (isEconomicContract)
        {
            foreach (var item in dto.PaymentSchedules)
            {
                if (!paymentScheduleMap.TryGetValue(item.Id, out var entity))
                {
                    continue;
                }

                item.ScheduleType = entity switch
                {
                    MonthlyPaymentSchedule => ScheduleType.Monthly,
                    QuarterlyPaymentSchedule => ScheduleType.Quarterly,
                    YearlyPaymentSchedule => ScheduleType.Yearly,
                    LumpSumPaymentSchedule => ScheduleType.LumpSum,
                    StagePaymentSchedule => ScheduleType.Stage,
                    _ => default
                };

                switch (entity)
                {
                    case MonthlyPaymentSchedule m:
                        item.Month = m.Month;
                        item.Year = m.Year;
                        break;

                    case QuarterlyPaymentSchedule q:
                        item.Quarter = q.Quarter;
                        item.Year = q.Year;
                        break;

                    case YearlyPaymentSchedule y:
                        item.Year = y.Year;
                        break;

                    case LumpSumPaymentSchedule l:
                        item.DueDate = l.DueDate;
                        break;

                    case StagePaymentSchedule s:
                        item.FromDate = s.FromDate;
                        item.ToDate = s.ToDate;
                        break;
                }
            }
        }

        var flows = await _contractSigningFlowRepo.GetAll().AsNoTracking()
            .Include(x => x.User).ThenInclude(u => u.UserDepartments).ThenInclude(ud => ud.Department)
            .Where(x => x.ContractId == id && x.DeletedOn == null)
            .OrderBy(x => x.SequenceOrder)
            .ToListAsync();

        var flowMap = flows.ToDictionary(f => f.Id, f => f);
        dto.SigningFlows = flows.Adapt<List<ContractSigningFlowDto>>();
        foreach (var item in dto.SigningFlows)
        {
            if (flowMap.TryGetValue(item.Id, out var flow))
            {
                item.UserName = flow.User.UserName;
                item.FullName = flow.User.Fullname;
                item.Role = flow.User.Role;
                item.DepartmentId = flow.User.UserDepartments.FirstOrDefault()!.DepartmentId;
                item.DepartmentName = flow.User.UserDepartments.FirstOrDefault()!.Department.Name;
            }
        }

        var itemMap = query.ContractItems.ToDictionary(i => i.Id, i => i);
        dto.ContractItems = query.ContractItems.Adapt<List<ContractItemDto>>();
        foreach (var item in dto.ContractItems.ToList())
        {
            if (itemMap.TryGetValue(item.Id, out var contractItem))
            {
                item.MaterialCode = contractItem.Material.MaterialCode;
                item.MaterialName = contractItem.Material.Name;
                if (contractItem.Material.IsOtherMaterial)
                {
                    dto.ContractOtherItems.Add(item);
                    dto.ContractItems.Remove(item);
                }
            }
        }

        var contractUserRoleMap = query.ContractUserRoles.ToDictionary(c => c.Id, c => c);
        foreach (var item in dto.ContractUserRoles)
        {
            if (contractUserRoleMap.TryGetValue(item.Id, out var contractUserRole))
            {
                item.Fullname = contractUserRole.User.Fullname;
                item.UserRole = contractUserRole.User.Role;
                item.DepartmentId = contractUserRole.User.UserDepartments.FirstOrDefault()?.DepartmentId ?? Guid.Empty;
                item.DepartmentName = contractUserRole.User.UserDepartments.FirstOrDefault()?.Department.Name ?? "";
            }
        }


        var attachments = await _contractAttachmentRepo.GetAll().AsNoTracking()
            .Where(x => x.ContractId == id && x.DeletedOn == null)
            .OrderByDescending(x => x.CreatedOn)
            .ToListAsync();
        dto.Attachments = attachments.Adapt<List<ContractAttachmentDto>>();

        dto.ProcurementMethodCode = query.ProcurementMethod.Code;
        dto.ProcurementMethodName = query.ProcurementMethod.Name;
        dto.ContractRegisterName = query.ContractRegister.Name;
        dto.ContractGuarantee = query.ContractGuarantees.Adapt<List<ContractGuaranteeDto>>() ?? [];

        // Map BankAccount fields for each ContractGuarantee
        var contractGuaranteeMap = query.ContractGuarantees.ToDictionary(g => g.Id, g => g);
        foreach (var guarantee in dto.ContractGuarantee)
        {
            if (contractGuaranteeMap.TryGetValue(guarantee.Id, out var guaranteeEntity))
            {
                if (guaranteeEntity.BankAccount != null)
                {
                    guarantee.BankAccount = new BankAccountDto
                    {
                        Id = guaranteeEntity.BankAccount.Id,
                        BankName = guaranteeEntity.BankAccount.BankName,
                        AccountNumber = guaranteeEntity.BankAccount.AccountNumber,
                        AccountHolder = guaranteeEntity.BankAccount.AccountHolder,
                        IsActive = guaranteeEntity.BankAccount.IsActive
                    };
                }
                else
                {
                    // Luôn trả về BankAccount object với các trường mặc định khi null
                    guarantee.BankAccount = new BankAccountDto
                    {
                        Id = Guid.Empty,
                        BankName = string.Empty,
                        AccountNumber = string.Empty,
                        AccountHolder = string.Empty,
                        IsActive = false
                    };
                }
            }
        }

        var s3Tasks = new List<Task>();
        if (!string.IsNullOrEmpty(dto.FilePath))
        {
            dto.ContractName = Path.GetFileName(dto.FilePath);
            s3Tasks.Add(awsS3Service.GetPresignedDownloadUrl(dto.FilePath, BucketType.SourceDefault)
                .ContinueWith(t => dto.FilePath = t.Result));
        }

        if (!string.IsNullOrEmpty(dto.SignedFilePath))
        {
            s3Tasks.Add(awsS3Service.GetPresignedDownloadUrl(dto.SignedFilePath, BucketType.SourceDefault)
                .ContinueWith(t => dto.SignedFilePath = t.Result));
        }

        if (dto.Attachments != null && dto.Attachments.Any())
        {
            foreach (var att in dto.Attachments)
            {
                att.FileName = Path.GetFileName(att.FileName);
                s3Tasks.Add(awsS3Service.GetPresignedDownloadUrl(att.FilePath, BucketType.SourceDefault)
                    .ContinueWith(t => att.FilePath = t.Result));
            }
        }


        if (s3Tasks.Any())
        {
            await Task.WhenAll(s3Tasks);
        }

        return dto;
    }

    public async Task<List<ContractDto>> GetCurrentUserContractApprovalHistory()
    {
        var currentUserContractHistories = await _contractSigningFlowRepo.GetAllAsync(
            predicate: c => c.UserId == currentUser.UserId && c.Status == SigningFlowStatus.Signed,
            orderBy: c => c.OrderBy(c => c.CreatedOn),
            selector: c => c.Contract,
            include: c => c
                .Include(c => c.Contract).ThenInclude(c => c.Department)
                .Include(c => c.Contract).ThenInclude(c => c.Partner)
                .Include(c => c.Contract).ThenInclude(c => c.ContractType)
                .Include(c => c.Contract).ThenInclude(c => c.ProcurementMethod)
                .Include(c => c.Contract).ThenInclude(c => c.ContractRegister),
            disableTracking: true);

        var contracts = currentUserContractHistories.DistinctBy(c => c.Id).ToList();
        var dtos = contracts.Adapt<List<ContractDto>>();

        var contractIds = contracts.Select(c => c.Id).ToList();
        if (contractIds.Any())
        {
            var allSigningFlows = await _contractSigningFlowRepo.GetAllAsync(
                predicate: x => contractIds.Contains(x.ContractId),
                include: i => i.Include(x => x.User).ThenInclude(x => x.UserDepartments).ThenInclude(x => x.Department),
                orderBy: o => o.OrderBy(x => x.SequenceOrder),
                disableTracking: true);

            foreach (var dto in dtos)
            {
                dto.SigningFlows = allSigningFlows
                    .Where(x => x.ContractId == dto.Id)
                    .Select(flow => new ContractSigningFlowDto
                    {
                        Id = flow.Id,
                        ContractId = flow.ContractId,
                        UserId = flow.UserId,
                        UserName = flow.User?.UserName ?? string.Empty,
                        FullName = flow.User?.Fullname ?? string.Empty,
                        DepartmentId = flow.User?.UserDepartments?.FirstOrDefault()?.DepartmentId ?? Guid.Empty,
                        DepartmentName = flow.User?.UserDepartments?.FirstOrDefault()?.Department?.Name ?? string.Empty,
                        Role = flow.User?.Role,
                        SequenceOrder = flow.SequenceOrder,
                        SignatureType = flow.SignatureType,
                        PositionX = flow.PositionX,
                        PositionY = flow.PositionY,
                        PageNumber = flow.PageNumber,
                        Width = flow.Width,
                        Height = flow.Height,
                        Status = flow.Status.ToString(),
                        SignedAt = flow.SignedAt,
                        RejectionReason = flow.RejectionReason,
                        RevisionNotes = flow.RevisionNotes
                    })
                    .ToList();
            }
        }

        return dtos;
    }

    public async Task<List<ContractDto>> GetPendingApprovalContractsAsync(ContractStatus? status = null, ContractSubStatus? subStatus = null)
    {
        var userFlows = await _contractSigningFlowRepo.GetAllAsync(
            predicate: x => x.UserId == currentUser.UserId && x.Status == SigningFlowStatus.Pending,
            include: i => i
                .Include(x => x.Contract).ThenInclude(x => x.ContractType)
                .Include(x => x.Contract).ThenInclude(x => x.Partner)
                .Include(x => x.Contract).ThenInclude(x => x.Department),
            disableTracking: true
            );

        var pendingContracts = new List<Contract>();
        var contractIds = new List<Guid>();
        foreach (var flow in userFlows)
        {
            // Check if all previous flows are signed
            var previousFlows = await _contractSigningFlowRepo.GetAllAsync(
                predicate: x => x.ContractId == flow.ContractId && x.SequenceOrder < flow.SequenceOrder,
                disableTracking: true
                );

            if (previousFlows.All(x => x.Status == SigningFlowStatus.Signed))
            {
                pendingContracts.Add(flow.Contract);
                contractIds.Add(flow.ContractId);
            }
        }

        // Apply status filters if provided
        if (status.HasValue)
        {
            pendingContracts = pendingContracts.Where(c => c.Status == status.Value).ToList();
            contractIds = pendingContracts.Select(c => c.Id).ToList();
        }

        if (subStatus.HasValue)
        {
            pendingContracts = pendingContracts.Where(c => c.SubStatus == subStatus.Value).ToList();
            contractIds = pendingContracts.Select(c => c.Id).ToList();
        }

        var dtos = pendingContracts.Adapt<List<ContractDto>>();

        // Load signing flows separately to avoid cycle
        if (contractIds.Any())
        {
            var allSigningFlows = await _contractSigningFlowRepo.GetAllAsync(
                predicate: x => contractIds.Contains(x.ContractId),
                include: i => i.Include(x => x.User).ThenInclude(x => x.UserDepartments).ThenInclude(x => x.Department),
                orderBy: o => o.OrderBy(x => x.SequenceOrder),
                disableTracking: true
            );

            foreach (var dto in dtos)
            {
                dto.SigningFlows = allSigningFlows
                    .Where(x => x.ContractId == dto.Id)
                    .Select(flow => new ContractSigningFlowDto
                    {
                        Id = flow.Id,
                        ContractId = flow.ContractId,
                        UserId = flow.UserId,
                        UserName = flow.User?.UserName,
                        FullName = flow.User?.Fullname,
                        DepartmentId = flow.User?.UserDepartments?.FirstOrDefault()?.DepartmentId ?? Guid.Empty,
                        DepartmentName = flow.User?.UserDepartments?.FirstOrDefault()?.Department?.Name,
                        Role = flow.User?.Role,
                        SequenceOrder = flow.SequenceOrder,
                        SignatureType = flow.SignatureType,
                        PositionX = flow.PositionX,
                        PositionY = flow.PositionY,
                        PageNumber = flow.PageNumber,
                        Width = flow.Width,
                        Height = flow.Height,
                        Status = flow.Status.ToString(),
                        SignedAt = flow.SignedAt,
                        RejectionReason = flow.RejectionReason,
                        RevisionNotes = flow.RevisionNotes
                    })
                    .ToList();
            }
        }

        return dtos;
    }

    public async Task<bool> UpdateAsync(Guid id, UpdateContractDto dto)
    {
        var entity = await _contractRepo.GetFirstOrDefaultAsync(
            predicate: c => c.Id == id,
            include: c => c.Include(c => c.ContractSigningFlows)
                .Include(c => c.ContractGuarantees)
                .Include(c => c.ContractUserRoles).ThenInclude(c => c.User).ThenInclude(u => u.UserDepartments).ThenInclude(ud => ud.Department)
                .Include(c => c.PaymentSchedules)
                .Include(c => c.ContractItems).ThenInclude(c => c.Material)
                .Include(c => c.ContractAttachments),
            disableTracking: false);

        if (dto.Level2CodeId.HasValue)
        {
            var level2Code = await _level2CodeRepo.FindAsync(dto.Level2CodeId.Value);
            if (level2Code == null)
            {
                throw new NotFoundException("Level2Code not found");
            }
        }

        if (dto.Level3CodeId.HasValue)
        {
            var level3Code = await _level3CodeRepo.FindAsync(dto.Level3CodeId.Value);
            if (level3Code == null)
            {
                throw new NotFoundException("Level3Code not found");
            }
        }

        if (dto.ContractStructureId.HasValue)
        {
            var contractStructure = await _contractStructureCatalogRepo.GetFirstOrDefaultAsync(
                predicate: x => x.Id == dto.ContractStructureId.Value && x.IsActive,
                disableTracking: true);
            if (contractStructure == null)
            {
                throw new NotFoundException("Contract structure catalog not found or inactive");
            }
        }

        if (entity == null || entity.DeletedOn != null)
        {
            throw new NotFoundException("Contract not found");
        }

        // Không cho phép sửa hợp đồng đã lưu trữ
        if (entity.Status == ContractStatus.Archive)
        {
            throw new BadRequestException("Cannot edit an archived contract. Contract is read-only.");
        }

        // Chỉ cho phép sửa hợp đồng đang ở trạng thái Draft
        if (entity.Status != ContractStatus.Draft)
        {
            throw new BadRequestException("Only draft contracts can be edited. Current status: " + entity.Status);
        }

        var user = await _userRepo.FindAsync(currentUser.UserId);
        var isDraftingOfficer = entity.ContractUserRoles.Any(r => r.UserId == currentUser.UserId && r.Role == ContractRole.DraftingOfficer);
        var isAdmin = user?.Role == UserRole.Admin;

        if (!isAdmin && !isDraftingOfficer)
        {
            throw new BadRequestException("Only the direct negotiator and contract drafter (Drafting Officer) is allowed to edit this contract.");
        }

        var newFlows = dto.SigningFlows ?? new List<UpdateContractSigningFlowDto>();
        var newFlowMap = newFlows.Where(f => f.Id != Guid.Empty).ToDictionary(f => f.Id, f => f);

        var insertFlowDtos = newFlows.Where(f => f.Id == Guid.Empty).ToList();
        var deleteFlowList = new List<ContractSigningFlow>();
        var updateFlowList = new List<ContractSigningFlow>();

        foreach (var existingFlow in entity.ContractSigningFlows.ToList())
        {
            if (newFlowMap.TryGetValue(existingFlow.Id, out var updateDto))
            {
                existingFlow.Update(updateDto.UserId, updateDto.SequenceOrder, updateDto.SignatureType, updateDto.PositionX, updateDto.PositionY, updateDto.PageNumber, updateDto.Width, updateDto.Height);

                updateFlowList.Add(existingFlow);
                insertFlowDtos.Remove(updateDto);
            }
            else
            {
                // DELETE: không có trong DTO mới → đánh dấu xóa
                deleteFlowList.Add(existingFlow);
            }
        }

        var oldEntity = entity;
        // Lấy ContractTypeId từ Level1Code (1-1 relationship) nếu Level1CodeId có giá trị
        Guid autoContractTypeId = Guid.Empty;
        if (dto.Level1CodeId.HasValue)
        {
            var level1Code = await _Level1CodeRepo.FindAsync(dto.Level1CodeId.Value);
            if (level1Code != null)
            {
                autoContractTypeId = level1Code.ContractTypeId;
            }
        }

        entity.Update(
                isDebtTrackingEndable: dto.IsDebtTrackingEnabled,
                isAutoLiquidated: dto.IsAutoLiquidated,
                contractTypeId: autoContractTypeId,
                contractFieldId: dto.ContractFieldId,
                partnerId: dto.PartnerId,
                departmentId: dto.DepartmentId,
                contractValue: dto.ContractValue,
                startDate: dto.StartDate,
                endDate: dto.EndDate,
                filePath: dto.ContractFilePath,
                notes: dto.Notes,
                contractFormat: dto.ContractFormat,
                level1CodeId: dto.Level1CodeId,
                level2CodeId: dto.Level2CodeId,
                level3CodeId: dto.Level3CodeId,
                contractStructureId: dto.ContractStructureId,
                contractNumber: dto.ContractNumber,
                appendixNumber: dto.AppendixNumber,
                procurementMethodId: dto.ProcurementMethodId,
                contractRegisterId: dto.ContractRegisterId,
                paymentPlanType: PaymentPlanType.Monthly,
                discountType: dto.DiscountType,
                vatPercentage: dto.VatPercentage,
                scheduleType: dto.PaymentSchedules?.ScheduleType,
                discountValue: dto.DiscountValue
            );

        await unitOfWork.BeginTransactionAsync();

        try
        {
            if (deleteFlowList.Any())
            {
                var otherDeleteFlowLists = new List<ContractSigningFlow>();
                foreach (var item in deleteFlowList)
                {
                    var otherFlowDelete = entity.ContractSigningFlows.FirstOrDefault(o => o.Id == item.Id);
                    if (otherFlowDelete != null)
                    {
                        otherDeleteFlowLists.Add(otherFlowDelete);
                    }
                }
                deleteFlowList.AddRange(otherDeleteFlowLists);
                _contractSigningFlowRepo.Delete(deleteFlowList);
            }

            if (insertFlowDtos.Any())
            {
                foreach (var item in insertFlowDtos)
                {
                    entity.AddFlow(ContractSigningFlow.Create(item.UserId, item.SequenceOrder, item.SignatureType, item.PositionX, item.PositionY, item.PageNumber, item.Width, item.Height));
                }
            }

            // Xử lý quan hệ cha-con (ContractRelationship)
            // Xóa tất cả quan hệ cũ nơi contract này là con
            var oldRelationships = await _contractRelationshipRepo.GetAllAsync(
                predicate: r => r.ChildContractId == id);
            if (oldRelationships.Any())
            {
                _contractRelationshipRepo.Delete(oldRelationships.ToList());
            }

            // Tạo quan hệ mới nếu có ParentRelationship
            if (dto.ParentRelationship != null && dto.ParentRelationship.ParentContractId != Guid.Empty)
            {
                var parentContract = await _contractRepo.FindAsync(dto.ParentRelationship.ParentContractId)
                    ?? throw new NotFoundException("Parent contract not found");
                var relationship = ContractRelationship.Create(
                    dto.ParentRelationship.ParentContractId,
                    parentContract.ContractFormat,  
                    id,
                    entity.ContractFormat,          
                    dto.ParentRelationship.RelationType,
                    null);
                await _contractRelationshipRepo.InsertAsync(relationship);
            }

            // Xử lý Child Relationships (contract này là cha)
            // Xóa tất cả quan hệ cũ nơi contract này là cha
            var oldChildRelationships = await _contractRelationshipRepo.GetAllAsync(
                predicate: r => r.ParentContractId == id);
            if (oldChildRelationships.Any())
            {
                _contractRelationshipRepo.Delete(oldChildRelationships.ToList());
            }

            // Tạo quan hệ mới nếu có ChildRelationships
            if (dto.ChildRelationships != null && dto.ChildRelationships.Any())
            {
                var childContractIds = dto.ChildRelationships.Select(c => c.ChildContractId).Distinct();
                var childContracts = await _contractRepo.GetAllAsync(
                    predicate: c => childContractIds.Contains(c.Id),
                    disableTracking: false);

                var childContractMap = childContracts.ToDictionary(c => c.Id, c => c);

                foreach (var childRelationship in dto.ChildRelationships)
                {
                    if (!childContractMap.TryGetValue(childRelationship.ChildContractId, out var childContract))
                    {
                        throw new NotFoundException($"Child contract with ID {childRelationship.ChildContractId} not found");
                    }

                    var relationship = ContractRelationship.Create(
                        id,
                        entity.ContractFormat,
                        childRelationship.ChildContractId,
                        childContract.ContractFormat,
                        childRelationship.RelationType,
                        null);

                    await _contractRelationshipRepo.InsertAsync(relationship);
                }
            }

            // Chỉ update PaymentSchedules và ContractGuarantee cho hợp đồng kinh tế
            var isEconomicContract = entity.ContractFormat == ContractFormat.EconomicBuy || entity.ContractFormat == ContractFormat.EconomicSell;

            if (isEconomicContract)
            {
                await UpdatePaymentSchedule(entity, dto.PaymentSchedules);
            }
            else
            {
                // Nếu là hợp đồng Template, xóa hết PaymentSchedules nếu có
                if (entity.PaymentSchedules.Any())
                {
                    _paymentScheduleRepo.Delete(entity.PaymentSchedules.ToList());
                    entity.ClearPaymentSchedule();
                }
            }

            var roles = new List<ContractUserRole>();

            await UpdateContractUserRoles(entity, dto.ContractUserRoles.ToDomain(entity.Id));

            _contractItemRepo.Delete(entity.ContractItems);
            entity.ClearContractItem();

            var materialIds = dto.ContractItems.Select(c => c.MaterialId).Distinct();
            var materialMap = (await _materialRepo.GetAllAsync(predicate: m => materialIds.Contains(m.Id))).ToDictionary(m => m.Id, m => m.Price);
            var contractItems = dto.ContractItems
                .Select(p =>
                {
                    if (materialMap.TryGetValue(p.MaterialId, out var mPrice))
                    {
                        return ContractItem.Create(p.MaterialId, p.Quantity, mPrice ?? 0);
                    }
                    else
                    {
                        return null;
                    }
                }).Where(c => c != null).ToList();
            entity.AddContractItem(contractItems);

            // Chỉ update ContractGuarantee cho hợp đồng kinh tế
            if (isEconomicContract)
            {
                // Xóa tất cả guarantees hiện có
                if (entity.ContractGuarantees.Any())
                {
                    _contractGuaranteeRepo.Delete(entity.ContractGuarantees.ToList());
                }

                // Thêm guarantees mới từ DTO
                if (dto.ContractGuarantee != null)
                {
                    if (dto.ContractGuarantee.PerformanceBondGuarantee != null)
                    {
                        var guaranteeDto = dto.ContractGuarantee.PerformanceBondGuarantee;
                        entity.AddContractGuarantee(ContractGuarantee.Create(GuaranteeType.PerformanceBond, guaranteeDto.Value, guaranteeDto.ValueType, guaranteeDto.DurationDate, guaranteeDto.BankAccountId));
                    }

                    if (dto.ContractGuarantee.WarrantyBondGuarantee != null)
                    {
                        var guaranteeDto = dto.ContractGuarantee.WarrantyBondGuarantee;
                        entity.AddContractGuarantee(ContractGuarantee.Create(GuaranteeType.WarrantyBond, guaranteeDto.Value, guaranteeDto.ValueType, guaranteeDto.DurationDate, guaranteeDto.BankAccountId));
                    }

                    if (dto.ContractGuarantee.DepositGuarantee != null)
                    {
                        var guaranteeDto = dto.ContractGuarantee.DepositGuarantee;
                        entity.AddContractGuarantee(ContractGuarantee.Create(GuaranteeType.Deposit, guaranteeDto.Value, guaranteeDto.ValueType, guaranteeDto.DurationDate, guaranteeDto.BankAccountId));
                    }
                }
            }
            else
            {
                // Nếu là hợp đồng Template, xóa hết ContractGuarantees nếu có
                if (entity.ContractGuarantees.Any())
                {
                    _contractGuaranteeRepo.Delete(entity.ContractGuarantees.ToList());
                }
            }

            // Update AttachmentFiles
            if (entity.ContractAttachments.Any())
            {
                _contractAttachmentRepo.Delete(entity.ContractAttachments.ToList());
            }

            if (dto.AttachmentFiles != null && dto.AttachmentFiles.Any())
            {
                var attachments = dto.AttachmentFiles
                    .Select(att => ContractAttachment.Create(
                        entity.Id,
                        att.FileName,
                        att.FilePath,
                        att.FileSize,
                        Path.GetExtension(att.FileName),
                        ""))
                    .ToList();
                await _contractAttachmentRepo.InsertAsync(attachments);
            }

            var signedContentId = await SyncSignedContentLinkAsync(dto.Level3CodeId);
            entity.SetSignedContentId(signedContentId);

            _contractRepo.Update(entity);
            await unitOfWork.SaveChangesAsync();

            await TrackContractChangesAsync(id, oldEntity, entity);

            await unitOfWork.CommitAsync();
            return true;
        }
        catch
        {
            await unitOfWork.RollbackAsync();
            throw;
        }
    }

    public async Task<IList<CreateContractAttachmentDto>> UploadAttachmentFile(List<IFormFile> AttachmentFiles, string ContractNumber)
    {
        if (AttachmentFiles != null && AttachmentFiles.Any())
        {
            var allowedAttachmentExtensions = new[] { ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".jpg", ".jpeg", ".png" };
            const long maxAttachmentSize = 200 * 1024 * 1024;

            foreach (var file in AttachmentFiles)
            {
                var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();

                if (!allowedAttachmentExtensions.Contains(fileExtension))
                {
                    throw new BadRequestException($"File {file.FileName} has invalid format");
                }

                if (file.Length > maxAttachmentSize)
                {
                    throw new BadRequestException($"File {file.FileName} exceeds 5MB limit");
                }
            }
        }

        var attachmentFiles = new List<CreateContractAttachmentDto>();

        var uploadTasks = new List<Task>();
        if (AttachmentFiles != null && AttachmentFiles.Any())
        {
            var listPathTask = AttachmentFiles.Select(async attachmentFile =>
            {
                var inputModel = new AwsInputModel
                {
                    FileId = Guid.NewGuid(),
                    FileName = attachmentFile.FileName,
                    BucketType = Application.Dto.Cloud.AWS.BucketType.SourceDefault,
                    Module = $"contracts/{ContractNumber}/attachments",
                    ContentType = attachmentFile.ContentType,
                    IsExpires = true
                };

                var resultModel = await awsS3Service.UploadFileAsync(attachmentFile, inputModel);

                return new CreateContractAttachmentDto
                {
                    FileName = attachmentFile.FileName,
                    FilePath = resultModel.Path,
                    FileSize = attachmentFile.Length,
                    FileType = Path.GetExtension(attachmentFile.FileName).ToLowerInvariant()
                };
            }).ToList();

            uploadTasks.Add(Task.Run(async () =>
            {
                attachmentFiles = (await Task.WhenAll(listPathTask)).ToList();
            }));
        }

        if (uploadTasks.Any())
        {
            await Task.WhenAll(uploadTasks);
        }

        return attachmentFiles;
    }

    public async Task<string> UploadContract(IFormFile ContractFile, string ContractNumber)
    {
        if (ContractFile != null)
        {
            if (!string.Equals(ContractFile.ContentType, "application/pdf",
                StringComparison.OrdinalIgnoreCase))
            {
                throw new BadRequestException("Contract file must be PDF format");
            }

            // Validate file size (e.g., max 10MB)
            const long maxFileSize = 200 * 1024 * 1024; // 10MB
            if (ContractFile.Length > maxFileSize)
            {
                throw new BadRequestException("Contract file size must not exceed 10MB");
            }
        }

        string? contractFilePath = "";

        var uploadTasks = new List<Task>();
        //upload contract
        if (ContractFile != null)
        {
            var inputModel = new AwsInputModel
            {
                FileId = Guid.NewGuid(),
                FileName = ContractFile.FileName,
                BucketType = Application.Dto.Cloud.AWS.BucketType.SourceDefault,
                Module = $"contracts/{ContractNumber}/origins",
                ContentType = ContractFile.ContentType,
                IsExpires = true
            };
            uploadTasks.Add(Task.Run(async () =>
            {
                var resultModel = await awsS3Service.UploadFileAsync(ContractFile, inputModel);
                contractFilePath = resultModel.Path;
            }));
        }

        if (uploadTasks.Any())
        {
            await Task.WhenAll(uploadTasks);
        }

        return contractFilePath;
    }

    private async Task TrackContractChangesAsync(Guid contractId, Contract oldEntity, Contract newEntity)
    {
        var changes = new List<ContractEditHistory>();
        var properties = typeof(Contract).GetProperties()
            .Where(p => p.CanRead && p.CanWrite &&
                       !p.Name.Contains("Created") &&
                       !p.Name.Contains("Modified") &&
                       !p.Name.Contains("Deleted"));

        foreach (var prop in properties)
        {
            var oldValue = prop.GetValue(oldEntity)?.ToString();
            var newValue = prop.GetValue(newEntity)?.ToString();

            if (oldValue != newValue)
            {
                changes.Add(ContractEditHistory.Create(contractId, currentUser.UserId, prop.Name, oldValue, newValue, null));
            }
        }

        if (changes.Any())
        {
            await _contractEditHistoryRepo.InsertAsync(changes);
            await unitOfWork.SaveChangesAsync();
        }
    }

    private async Task<Guid?> ResolveSignedContentIdForLevel3CodeAsync(Guid? level3CodeId)
    {
        if (!level3CodeId.HasValue)
        {
            return null;
        }

        var signedContent = await _signedContentRepo.GetFirstOrDefaultAsync(
            predicate: x => x.Level3CodeId == level3CodeId.Value,
            disableTracking: false);

        if (signedContent == null)
        {
            throw new NotFoundException("SignedContent not found for selected Level3Code");
        }

        return signedContent.Id;
    }

    private async Task<Guid?> SyncSignedContentLinkAsync(Guid? newLevel3CodeId)
    {
        return await ResolveSignedContentIdForLevel3CodeAsync(newLevel3CodeId);
    }

    private async Task ValidateReferencesAsync(CreateContractDto dto)
    {
        var department = await _departmentRepo.FindAsync(dto.DepartmentId);
        if (department == null)
        {
            throw new NotFoundException("Department not found");
        }

        // Validate Level1Code (ContractTypeId will be auto-filled from Level1Code) - optional
        if (dto.Level1CodeId.HasValue)
        {
            var level1Code = await _Level1CodeRepo.FindAsync(dto.Level1CodeId.Value);
            if (level1Code == null)
            {
                throw new NotFoundException("Level1Code not found");
            }
        }

        if (dto.Level2CodeId.HasValue)
        {
            var level2Code = await _level2CodeRepo.FindAsync(dto.Level2CodeId.Value);
            if (level2Code == null)
            {
                throw new NotFoundException("Level2Code not found");
            }
        }

        if (dto.PartnerId.HasValue)
        {
            var partner = await _partnerRepo.FindAsync(dto.PartnerId.Value);
            if (partner == null)
            {
                throw new NotFoundException("Partner not found");
            }
        }

        if (dto.ContractStructureId.HasValue)
        {
            var contractStructure = await _contractStructureCatalogRepo.GetFirstOrDefaultAsync(
                predicate: x => x.Id == dto.ContractStructureId.Value && x.IsActive,
                disableTracking: true);
            if (contractStructure == null)
            {
                throw new NotFoundException("Contract structure catalog not found or inactive");
            }
        }

        // Batch query users thay vì query từng user
        if (dto.SigningFlows != null)
        {
            var userIds = dto.SigningFlows.Select(f => f.UserId).Distinct().ToList();
            var users = await _userRepo.GetAllAsync(
                predicate: u => userIds.Contains(u.Id),
                disableTracking: true);

            var validUserIds = users
                .Where(u => u.DeletedOn == null)
                .Select(u => u.Id)
                .ToHashSet();

            var invalidUserIds = userIds.Except(validUserIds).ToList();
            if (invalidUserIds.Any())
            {
                throw new NotFoundException($"User {invalidUserIds.First()} not found");
            }
        }
    }

    private async Task UpdatePaymentSchedule(
    Contract entity,
    CreatePaymentScheduleListDto? dtos)
    {
        if (dtos == null || dtos.Schedules == null || !dtos.Schedules.Any())
        {
            // Xóa hết payment schedules nếu không có data
            if (entity.PaymentSchedules.Any())
            {
                _paymentScheduleRepo.Delete(entity.PaymentSchedules.ToList());
                entity.ClearPaymentSchedule();
            }
            return;
        }

        var newPayments = dtos.Schedules.ToList();

        // Xóa hết payment schedules cũ
        if (entity.PaymentSchedules.Any())
        {
            _paymentScheduleRepo.Delete(entity.PaymentSchedules.ToList());
            entity.ClearPaymentSchedule();
        }

        // Tạo mới tất cả payment schedules
        var newList = new List<PaymentSchedule>();
        foreach (var dto in newPayments)
        {
            var schedule = dto.ToDomain(entity.Id, dtos.ScheduleType);
            newList.Add(schedule);
        }

        entity.AddPaymentSchedules(newList);
    }

    private async Task UpdateContractUserRoles(
        Contract entity,
        List<ContractUserRole> dtos)
    {
        var newRoles = dtos ?? new();

        var roleMap = newRoles
            .Where(x => x.Id != Guid.Empty)
            .ToDictionary(x => x.Id);

        // 1. Validate ID belongs to this Contract
        var dbIds = entity.ContractUserRoles.Select(x => x.Id).ToHashSet();
        var invalidIds = roleMap.Keys.Except(dbIds).ToList();

        if (invalidIds.Any())
        {
            throw new BadRequestException("Some ContractUserRole IDs do not belong to this contract");
        }

        var insertDtos = newRoles
            .Where(x => x.Id == Guid.Empty)
            .ToList();

        var deleteList = new List<ContractUserRole>();
        var updateList = new List<ContractUserRole>();

        foreach (var existing in entity.ContractUserRoles)
        {
            if (roleMap.TryGetValue(existing.Id, out var dto))
            {
                existing.Update(
                    dto.UserId,
                    dto.Role
                );

                updateList.Add(existing);
            }
            else
            {
                deleteList.Add(existing);
            }
        }

        if (deleteList.Any())
        {
            _contractUserRoleRepo.Delete(deleteList);
            entity.ClearContractUserRoles(deleteList);
        }

        var newList = new List<ContractUserRole>();
        foreach (var dto in insertDtos)
        {
            newList.Add(ContractUserRole.Create(
                dto.UserId,
                dto.Role
            ));
        }
        entity.AddContractUserRoles(newList);
    }

    public async Task<List<ShortContractDto>> GetAllSoonExpiredContractsAsync(ContractFormat? contractFormat)
    {
        var notificationConfig = await _notificationConfigRepo.GetFirstOrDefaultAsync(
            predicate: x => x.EventType == NotificationEventType.ContractExpiring && x.IsEnabled,
            disableTracking: true);

        if (notificationConfig == null)
        {
            return new List<ShortContractDto>();
        }

        var today = DateTimeOffset.UtcNow;
        var expirationThresholdDate = today.AddDays(notificationConfig.DaysBefore);

        var query = _contractRepo.GetAll().AsNoTracking()
            .Include(x => x.ContractType)
            .Include(x => x.ContractStructureCatalog)
            .Include(x => x.Partner)
            .Include(x => x.Department)
            .Include(x => x.ContractSigningFlows).ThenInclude(x => x.User).ThenInclude(x => x.UserDepartments).ThenInclude(x => x.Department)
            .Include(x => x.ContractUserRoles).ThenInclude(x => x.User).ThenInclude(x => x.UserDepartments).ThenInclude(x => x.Department)
            .Include(x => x.ContractItems)
            .Include(x => x.ProcurementMethod)
            .Include(x => x.ContractRegister)
            .Where(x => (x.ContractFormat == contractFormat || contractFormat == null) &&
                       x.Status == ContractStatus.Active &&
                       x.DeletedOn == null &&
                       x.EndDate >= today &&
                       x.EndDate <= expirationThresholdDate)
            .OrderBy(x => x.EndDate);

        var signingFlowMap = query.ToDictionary(x => x.Id, x => x.ContractSigningFlows);
        var contractUserRoleMap = query.ToDictionary(x => x.Id, x => x.ContractUserRoles);

        var items = await query.ToListAsync();

        var result = items.Adapt<List<ShortContractDto>>();
        var itemMap = items.ToDictionary(i => i.Id, i => i);

        foreach (var item in result)
        {
            if (itemMap.TryGetValue(item.Id, out var mappedContract))
            {
                item.ContractStructureName = mappedContract.ContractStructureCatalog?.Name ?? string.Empty;
            }

            if (signingFlowMap.TryGetValue(item.Id, out var flows))
            {
                item.SigningFlows = flows.Select(f => new ContractSigningFlowDto
                {
                    Id = f.Id,
                    ContractId = f.ContractId,
                    Height = f.Height,
                    PageNumber = f.PageNumber,
                    PositionX = f.PositionX,
                    PositionY = f.PositionY,
                    RejectionReason = f.RejectionReason,
                    RevisionNotes = f.RevisionNotes,
                    SequenceOrder = f.SequenceOrder,
                    SignatureType = f.SignatureType,
                    SignedAt = f.SignedAt,
                    Status = f.Status.ToString(),
                    Width = f.Width,
                    UserId = f.UserId,
                    UserName = f.User.UserName,
                    FullName = f.User.Fullname,
                    Role = f.User.Role,
                    DepartmentId = f.User.UserDepartments.FirstOrDefault().DepartmentId,
                    DepartmentName = f.User.UserDepartments.FirstOrDefault().Department.Name,
                }).ToList();
            }

            if (contractUserRoleMap.TryGetValue(item.Id, out var roles))
            {
                item.ContractUserRoles = roles.Select(r => new ContractUserRoleDto
                {
                    Id = r.Id,
                    ContractId = r.ContractId,
                    DepartmentId = r.User.UserDepartments.FirstOrDefault().DepartmentId,
                    DepartmentName = r.User.UserDepartments.FirstOrDefault().Department.Name,
                    Fullname = r.User.Fullname,
                    UserId = r.UserId,
                    Role = r.Role,
                    UserRole = r.User.Role
                }).ToList();
            }
        }

        return result;
    }

    public async Task<List<ShortContractDto>> GetAllContractsWithPaymentDueSoonAsync(ContractFormat? contractFormat)
    {
        var notificationConfig = await _notificationConfigRepo.GetFirstOrDefaultAsync(
            predicate: x => x.EventType == NotificationEventType.PaymentDue && x.IsEnabled,
            disableTracking: true);

        if (notificationConfig == null)
        {
            return new List<ShortContractDto>();
        }

        var currentUserId = currentUser.UserId;

        var query = _contractRepo.GetAll().AsNoTracking()
            .Include(x => x.ContractType)
            .Include(x => x.ContractStructureCatalog)
            .Include(x => x.Partner)
            .Include(x => x.Department)
            .Include(x => x.ContractSigningFlows).ThenInclude(x => x.User).ThenInclude(x => x.UserDepartments).ThenInclude(x => x.Department)
            .Include(x => x.ContractUserRoles).ThenInclude(x => x.User).ThenInclude(x => x.UserDepartments).ThenInclude(x => x.Department)
            .Include(x => x.ContractItems)
            .Include(x => x.PaymentSchedules)
            .Include(x => x.ProcurementMethod)
            .Include(x => x.ContractRegister)
            .Where(x => (x.ContractFormat == contractFormat || contractFormat == null) &&
                       x.Status == ContractStatus.Active &&
                       x.DeletedOn == null &&
                       (x.CreatedBy == currentUserId || x.ContractUserRoles.Any(r => r.UserId == currentUserId)));

        var items = await query.ToListAsync();

        // Filter contracts that have unpaid payment schedules due soon
        var contractsWithDuePayments = items
            .Where(x => x.PaymentSchedules.Any(ps => ps.IsPaymentDueSoon(notificationConfig.DaysBefore)))
            .ToList();

        var signingFlowMap = items.ToDictionary(x => x.Id, x => x.ContractSigningFlows);
        var contractUserRoleMap = items.ToDictionary(x => x.Id, x => x.ContractUserRoles);

        var result = contractsWithDuePayments.Adapt<List<ShortContractDto>>();
        var itemMap = contractsWithDuePayments.ToDictionary(i => i.Id, i => i);

        foreach (var item in result)
        {
            if (itemMap.TryGetValue(item.Id, out var mappedContract))
            {
                item.ContractStructureName = mappedContract.ContractStructureCatalog?.Name ?? string.Empty;
            }

            if (signingFlowMap.TryGetValue(item.Id, out var flows))
            {
                item.SigningFlows = flows.Select(f => new ContractSigningFlowDto
                {
                    Id = f.Id,
                    ContractId = f.ContractId,
                    Height = f.Height,
                    PageNumber = f.PageNumber,
                    PositionX = f.PositionX,
                    PositionY = f.PositionY,
                    RejectionReason = f.RejectionReason,
                    RevisionNotes = f.RevisionNotes,
                    SequenceOrder = f.SequenceOrder,
                    SignatureType = f.SignatureType,
                    SignedAt = f.SignedAt,
                    Status = f.Status.ToString(),
                    Width = f.Width,
                    UserId = f.UserId,
                    UserName = f.User.UserName,
                    FullName = f.User.Fullname,
                    Role = f.User.Role,
                    DepartmentId = f.User.UserDepartments.FirstOrDefault().DepartmentId,
                    DepartmentName = f.User.UserDepartments.FirstOrDefault().Department.Name,
                }).ToList();
            }

            if (contractUserRoleMap.TryGetValue(item.Id, out var roles))
            {
                item.ContractUserRoles = roles.Select(r => new ContractUserRoleDto
                {
                    Id = r.Id,
                    ContractId = r.ContractId,
                    DepartmentId = r.User.UserDepartments.FirstOrDefault().DepartmentId,
                    DepartmentName = r.User.UserDepartments.FirstOrDefault().Department.Name,
                    Fullname = r.User.Fullname,
                    UserId = r.UserId,
                    Role = r.Role,
                    UserRole = r.User.Role
                }).ToList();
            }
        }

        // Sort by earliest payment due date
        var today = DateTimeOffset.UtcNow;
        result = result.OrderBy(x =>
        {
            var contract = contractsWithDuePayments.FirstOrDefault(c => c.Id == x.Id);
            if (contract == null)
            {
                return DateTimeOffset.MaxValue;
            }

            var earliestDueDate = contract.PaymentSchedules
                .Where(ps => ps.IsPaymentDueSoon(notificationConfig.DaysBefore))
                .Select(ps => ps.GetDueDate())
                .Where(d => d.HasValue)
                .Min();

            return earliestDueDate ?? DateTimeOffset.MaxValue;
        }).ToList();

        return result;
    }

    public async Task<List<PaymentScheduleDto>> GetContractPaymentSchedulesAsync(Guid contractId)
    {
        var contract = await _contractRepo.GetFirstOrDefaultAsync(
            predicate: c => c.Id == contractId,
            include: c => c.Include(x => x.PaymentSchedules)
                           .ThenInclude(ps => ps.ContractPayments)
                           .ThenInclude(cp => cp.Invoice)
                           .Include(x => x.PaymentSchedules)
                           .ThenInclude(ps => ps.ContractPayments)
                           .ThenInclude(cp => cp.Tax!)
                           .Include(x => x.ContractItems).ThenInclude(x => x.Material)
                           .Include(x => x.PaymentSchedules)
                           .ThenInclude(ps => ps.ContractProgresses)
                           .ThenInclude(cp => cp.ProgressItems),
            disableTracking: true)
            ?? throw new NotFoundException("Contract not found");

        var effectiveContractValue = contract.ContractValue ?? 0;

        var result = new List<PaymentScheduleDto>();

        foreach (var schedule in contract.PaymentSchedules)
        {
            // Calculate payment amount based on AmountType
            decimal paymentAmount = schedule.AmountType == Domain.Common.Enums.ValueType.Percent
                ? effectiveContractValue * schedule.Amount / 100
                : schedule.Amount;

            var dto = new PaymentScheduleDto
            {
                Id = schedule.Id,
                ContractId = schedule.ContractId,
                Amount = schedule.Amount,
                AmountType = schedule.AmountType,
                PaymentAmount = paymentAmount,
                PaymentStatus = schedule.PaymentStatus,
                ContractPayments = schedule.ContractPayments.Select(cp => new ContractPaymentInfoDto
                {
                    Id = cp.Id,
                    PeriodNumber = cp.PeriodNumber,
                    AcceptanceReportFilePaths = cp.AcceptanceReportFilePaths,
                    InvoiceFilePaths = cp.InvoiceFilePaths,
                    Invoice = cp.Invoice == null
                        ? null
                        : new Application.Dto.Catalog.ContractPayment.InvoiceDto
                        {
                            NumberInvoice = cp.Invoice.NumberInvoice,
                            DateInvoice = cp.Invoice.DateInvoice
                        },
                    TaxFilePaths = cp.TaxFilePaths,
                    Tax = cp.Tax == null
                        ? null
                        : new Application.Dto.Catalog.ContractPayment.TaxDto
                        {
                            DeclarationDate = cp.Tax.DeclarationDate,
                            VatRate = cp.Tax.VatRate,
                            TaxableRevenue = cp.Tax.TaxableRevenue,
                            VatAmount = cp.Tax.VatAmount,
                            TaxCode = cp.Tax.TaxCode
                        },
                    PaymentDate = cp.PaymentDate,
                    Amount = cp.Amount
                }).ToList()
            };

            // Map all ContractProgresses
            if (schedule.ContractProgresses != null && schedule.ContractProgresses.Any())
            {
                dto.ContractProgresses = schedule.ContractProgresses.Select(contractProgress => new Application.Dto.Catalog.ContractProgress.ContractProgressDto
                {
                    Id = contractProgress.Id,
                    ContractId = contractProgress.ContractId,
                    PaymentScheduleId = contractProgress.PaymentScheduleId,
                    PeriodStart = contractProgress.PeriodStart,
                    PeriodEnd = contractProgress.PeriodEnd,
                    ProgressTotal = contractProgress.ProgressItems.Sum(pi => pi.ExecutedAmount)
                }).ToList();
            }

            // Map schedule type and specific properties
            dto.ScheduleType = schedule switch
            {
                MonthlyPaymentSchedule => ScheduleType.Monthly,
                QuarterlyPaymentSchedule => ScheduleType.Quarterly,
                YearlyPaymentSchedule => ScheduleType.Yearly,
                LumpSumPaymentSchedule => ScheduleType.LumpSum,
                StagePaymentSchedule => ScheduleType.Stage,
                _ => default
            };

            switch (schedule)
            {
                case MonthlyPaymentSchedule m:
                    dto.Month = m.Month;
                    dto.Year = m.Year;
                    break;

                case QuarterlyPaymentSchedule q:
                    dto.Quarter = q.Quarter;
                    dto.Year = q.Year;
                    break;

                case YearlyPaymentSchedule y:
                    dto.Year = y.Year;
                    break;

                case LumpSumPaymentSchedule l:
                    dto.DueDate = l.DueDate;
                    break;

                case StagePaymentSchedule s:
                    dto.FromDate = s.FromDate;
                    dto.ToDate = s.ToDate;
                    break;
            }

            result.Add(dto);
        }

        return result;
    }

    public async Task<ContractDashboardDto> GetContractDashboardAsync(ContractFormat? contractFormat = null)
    {
        var query = _contractRepo.GetAll()
            .Where(c => c.DeletedOn == null);

        if (contractFormat.HasValue)
        {
            query = query.Where(c => c.ContractFormat == contractFormat.Value);
        }

        var totalContracts = await query.CountAsync();

        var statusData = await query
            .GroupBy(c => c.Status)
            .Select(g => new
            {
                Status = g.Key,
                Count = g.Count()
            })
            .ToListAsync();

        var contractsByStatus = statusData
            .Where(x => x.Count > 0)
            .Select(x => new ContractStatusCountDto
            {
                StatusName = x.Status.ToString(),
                Count = x.Count
            })
            .OrderBy(x => x.StatusName)
            .ToList();

        return new ContractDashboardDto
        {
            TotalContracts = totalContracts,
            ContractsByStatus = contractsByStatus
        };
    }

    /// <summary>
    /// Get comprehensive contract management report (XDCB format)
    /// </summary>
    public async Task<ContractReportDto> GetContractReportAsync(Guid contractId)
    {
        try
        {
            // Get contract with all related data
            var contract = await _contractRepo.GetFirstOrDefaultAsync(
                predicate: c => c.Id == contractId,
                include: c => c
                    .Include(x => x.ContractType)
                    .Include(x => x.ContractStructureCatalog)
                    .Include(x => x.ProcurementMethod)
                    .Include(x => x.Partner)
                    .Include(x => x.Department)
                    .Include(x => x.ContractRegister)
                    .Include(x => x.Level1Code)
                    .Include(x => x.Level2Code)
                    .Include(x => x.Level3Code)
                    .Include(x => x.ContractItems)
                    .Include(x => x.ContractGuarantees)
                    .Include(x => x.ContractUserRoles)
                        .ThenInclude(x => x.User)
                    .Include(x => x.ContractProgresses)
                        .ThenInclude(x => x.ProgressItems)
                    .Include(x => x.PaymentSchedules)
                        .ThenInclude(x => x.ContractPayments),
                disableTracking: true);

            if (contract == null)
            {
                throw new NotFoundException($"Contract with ID {contractId} not found");
            }
            var user = _userRepo.GetFirstOrDefault(
                        predicate: x => x.Id == contract.CreatedBy,
                        disableTracking: true
                    );
            // Build the report DTO
            var report = new ContractReportDto
            {
                // 1. CONTRACT CLASSIFICATION INFORMATION
                CodeLevel1 = contract.Level1Code?.Code,
                CodeLevel2 = contract.Level2Code?.Code,
                CodeLevel3 = contract.Level3Code?.Code,
                ContractType = contract.ContractType?.Name,

                // 2. GENERAL CONTRACT INFORMATION
                SelectionMethod = contract.ProcurementMethod?.Name,
                ContractFormat = contract.ContractFormat.ToString(),
                ContractContentName = contract.ContractStructureCatalog?.Name,
                TrackingNumber = contract.ContractRegister?.Name,
                ContractCode = contract.ContractNumber,
                AppendixNumber = contract.AppendixNumber,

                // 3. PARTNER INFORMATION
                PartnerName = contract.Partner?.Name,
                Address = contract.Partner?.Address,
                TaxCode = contract.Partner?.TaxCode,
                RepresentativeName = contract.Partner?.ContactPerson,

                // 4. TIME & PAYMENT
                SigningDate = contract.StartDate.DateTime, // Not available in current entity
                ExpiryDate = contract.EndDate.DateTime,
                PaymentTerm = contract.ScheduleType?.ToString(),

                // 5. CONTRACT VALUE
                Quantity = contract.ContractItems.Any() ? contract.ContractItems.Sum(x => x.Quantity) : null,
                UnitPrice = contract.ContractItems.Any() ? contract.ContractItems.FirstOrDefault()?.Price : null,
                Amount = contract.ContractItems.Any() ? contract.ContractItems.Sum(x => x.Amount) : null,
                ContractValue = contract.ContractValue,
                GuaranteeValue = contract.ContractGuarantees.Any() 
                    ? $"{contract.ContractGuarantees.Sum(x => x.Value)} {(contract.ContractGuarantees.FirstOrDefault()?.ValueType.ToString() ?? "")}"
                    : null,
                GuaranteeTermAndBank = contract.ContractGuarantees.FirstOrDefault()?.DurationDate?.ToString("dd/MM/yyyy"),

                // 6. CONTRACT EXECUTION STATUS
                Execution = GetMonthlyExecutionData(contract),

                // 7. CONTRACT MANAGEMENT & COMPLETION
                LiquidationStatus = contract.IsAutoLiquidated ? "TTL" : (contract.Status == ContractStatus.Liquidated ? "R" : "C"),
                CreatedByUser = user?.Fullname,
                Manager = contract.ContractUserRoles
                    .FirstOrDefault(x => x.Role == ContractRole.Manager)?.User?.Fullname,
                ReceivingUnit = null, // Not available in current entity
                Notes = contract.Notes
            };

            return report;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting contract report for contract {ContractId}", contractId);
            throw;
        }
    }

    /// <summary>
    /// Helper method to calculate monthly execution data from ContractProgress
    /// </summary>
    private MonthlyExecutionDto GetMonthlyExecutionData(Contract contract)
    {
        var reportYear = contract.ContractProgresses.Any()
            ? contract.ContractProgresses.Max(x => x.PeriodStart.Year)
            : contract.StartDate.Year;

        var monthlyData = contract.ContractProgresses
            .Where(x => x.PeriodStart.Year == reportYear || x.PeriodEnd.Year == reportYear)
            .GroupBy(x => x.PeriodStart.Month)
            .ToDictionary(
                g => g.Key,
                g => new ExecutionPeriodDto
                {
                    Quantity = g.SelectMany(x => x.ProgressItems).Sum(x => x.ExecutedQuantity),
                    Amount = g.SelectMany(x => x.ProgressItems).Sum(x => x.ExecutedAmount)
                });

        var yearlyAccumulation = contract.GetYearlyProgressAccumulation(reportYear);
        var incompletedWork = contract.GetTotalWorkInProgress();

        return new MonthlyExecutionDto
        {
            Month1 = GetExecutionPeriod(monthlyData, 1),
            Month2 = GetExecutionPeriod(monthlyData, 2),
            Month3 = GetExecutionPeriod(monthlyData, 3),
            Month4 = GetExecutionPeriod(monthlyData, 4),
            Month5 = GetExecutionPeriod(monthlyData, 5),
            Month6 = GetExecutionPeriod(monthlyData, 6),
            Month7 = GetExecutionPeriod(monthlyData, 7),
            Month8 = GetExecutionPeriod(monthlyData, 8),
            Month9 = GetExecutionPeriod(monthlyData, 9),
            Month10 = GetExecutionPeriod(monthlyData, 10),
            Month11 = GetExecutionPeriod(monthlyData, 11),
            Month12 = GetExecutionPeriod(monthlyData, 12),
            YearlyAccumulation = new ExecutionPeriodDto
            {
                Quantity = yearlyAccumulation.TotalQuantity,
                Amount = yearlyAccumulation.TotalAmount
            },
            IncompletedWork = new ExecutionPeriodDto
            {
                Quantity = incompletedWork.RemainingQuantity,
                Amount = incompletedWork.RemainingAmount
            },
            EstimatedExecution = new ExecutionPeriodDto
            {
                Quantity = contract.ContractItems.Sum(x => x.Quantity),
                Amount = contract.ContractItems.Sum(x => x.Amount)
            }
        };
    }

    private static ExecutionPeriodDto GetExecutionPeriod(
        IReadOnlyDictionary<int, ExecutionPeriodDto> monthlyData,
        int month)
    {
        return monthlyData.TryGetValue(month, out var data)
            ? data
            : new ExecutionPeriodDto
            {
                Quantity = 0,
                Amount = 0
            };
    }

    /// <summary>
    /// Get all contract reports (XDCB format)
    /// </summary>
    public async Task<List<ContractReportDto>> GetAllContractReportsAsync(
        Guid? contractTypeId,
        Guid? level1CodeId,
        Guid? procurementMethodId,
        Guid? contractStructureCatalogId,
        Guid? partnerId,
        string? partnerName,
        DateTime? startDateFrom,
        DateTime? startDateTo,
        DateTime? endDateFrom,
        DateTime? endDateTo,
        DateTime? endDate,
        bool? isAutoLiquidated,
        bool? isLiquidated)
    {
        try
        {
            var normalizedPartnerName = partnerName?.Trim();

            // Get contracts with filters applied in DB query
            var contracts = await _contractRepo.GetAllAsync(
                predicate: c =>
                    (!contractTypeId.HasValue || c.ContractTypeId == contractTypeId.Value)
                    && (!level1CodeId.HasValue || c.Level1CodeId == level1CodeId.Value)
                    && (!procurementMethodId.HasValue || c.ProcurementMethodId == procurementMethodId.Value)
                    && (!contractStructureCatalogId.HasValue || c.ContractStructureId == contractStructureCatalogId.Value)
                    && (!partnerId.HasValue || c.PartnerId == partnerId.Value)
                    && (string.IsNullOrWhiteSpace(normalizedPartnerName)
                        || (c.Partner != null && c.Partner.Name.ToLower().Contains(normalizedPartnerName.ToLower())))
                    && (!startDateFrom.HasValue || c.StartDate >= startDateFrom.Value)
                    && (!startDateTo.HasValue || c.StartDate <= startDateTo.Value)
                    && (!endDateFrom.HasValue || c.EndDate >= endDateFrom.Value)
                    && (!endDateTo.HasValue || c.EndDate <= endDateTo.Value)
                    && (!endDate.HasValue || c.EndDate.Date == endDate.Value.Date)
                    && (!isAutoLiquidated.HasValue || c.IsAutoLiquidated == isAutoLiquidated.Value)
                    && (!isLiquidated.HasValue || (c.Status == ContractStatus.Liquidated) == isLiquidated.Value),
                include: c => c
                    .Include(x => x.ContractType)
                    .Include(x => x.ContractStructureCatalog)
                    .Include(x => x.ProcurementMethod)
                    .Include(x => x.Partner)
                    .Include(x => x.Department)
                    .Include(x => x.ContractRegister)
                    .Include(x => x.Level1Code)
                    .Include(x => x.Level2Code)
                    .Include(x => x.Level3Code)
                    .Include(x => x.ContractItems)
                    .Include(x => x.ContractGuarantees)
                    .Include(x => x.ContractUserRoles)
                        .ThenInclude(x => x.User)
                    .Include(x => x.ContractProgresses)
                        .ThenInclude(x => x.ProgressItems)
                    .Include(x => x.PaymentSchedules)
                        .ThenInclude(x => x.ContractPayments),
                disableTracking: true);

            var reports = new List<ContractReportDto>();

            foreach (var contract in contracts)
            {
                var user = _userRepo.GetFirstOrDefault(
                        predicate: x => x.Id == contract.CreatedBy,
                        disableTracking: true
                    );
                var report = new ContractReportDto
                {
                    // 1. CONTRACT CLASSIFICATION INFORMATION
                    CodeLevel1 = contract.Level1Code?.Code,
                    CodeLevel2 = contract.Level2Code?.Code,
                    CodeLevel3 = contract.Level3Code?.Code,
                    ContractType = contract.ContractType?.Name,

                    // 2. GENERAL CONTRACT INFORMATION
                    SelectionMethod = contract.ProcurementMethod?.Name,
                    ContractFormat = contract.ContractFormat.ToString(),
                    ContractContentName = contract.ContractStructureCatalog?.Name,
                    TrackingNumber = contract.ContractRegister?.Name,
                    ContractCode = contract.ContractNumber,
                    AppendixNumber = contract.AppendixNumber,

                    // 3. PARTNER INFORMATION
                    PartnerName = contract.Partner?.Name,
                    Address = contract.Partner?.Address,
                    TaxCode = contract.Partner?.TaxCode,
                    RepresentativeName = contract.Partner?.ContactPerson,

                    // 4. TIME & PAYMENT
                    SigningDate = contract.StartDate.DateTime,
                    ExpiryDate = contract.EndDate.DateTime,
                    PaymentTerm = contract.ScheduleType?.ToString(),

                    // 5. CONTRACT VALUE
                    Quantity = contract.ContractItems.Any() ? contract.ContractItems.Sum(x => x.Quantity) : null,
                    UnitPrice = contract.ContractItems.Any() ? contract.ContractItems.FirstOrDefault()?.Price : null,
                    Amount = contract.ContractItems.Any() ? contract.ContractItems.Sum(x => x.Amount) : null,
                    ContractValue = contract.ContractValue,
                    GuaranteeValue = contract.ContractGuarantees.Any() 
                        ? $"{contract.ContractGuarantees.Sum(x => x.Value)} {(contract.ContractGuarantees.FirstOrDefault()?.ValueType.ToString() ?? "")}"
                        : null,
                    GuaranteeTermAndBank = contract.ContractGuarantees.FirstOrDefault()?.DurationDate?.ToString("dd/MM/yyyy"),

                    // 6. CONTRACT EXECUTION STATUS
                    Execution = GetMonthlyExecutionData(contract),

                    // 7. CONTRACT MANAGEMENT & COMPLETION
                    LiquidationStatus = contract.IsAutoLiquidated ? "TTL" : (contract.Status == ContractStatus.Liquidated ? "R" : "C"),
                    CreatedByUser = user?.Fullname,
                    Manager = contract.ContractUserRoles
                        .FirstOrDefault(x => x.Role == ContractRole.Manager)?.User?.Fullname,
                    ReceivingUnit = null, // Not available in current entity
                    Notes = contract.Notes
                };

                reports.Add(report);
            }

            return reports;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting all contract reports");
            throw;
        }
    }

    /// <summary>
    /// Get material unit price report grouped by contract
    /// </summary>
    public async Task<List<ContractMaterialUnitPriceReportByYearDto>> GetContractMaterialUnitPriceReportsAsync(
        Guid? contractTypeId,
        Guid? level1CodeId,
        Guid? procurementMethodId,
        Guid? contractStructureCatalogId,
        Guid? partnerId,
        string? partnerName,
        DateTime? startDateFrom,
        DateTime? startDateTo,
        DateTime? endDateFrom,
        DateTime? endDateTo,
        DateTime? endDate,
        bool? isAutoLiquidated,
        bool? isLiquidated)
    {
        try
        {
            var normalizedPartnerName = partnerName?.Trim();

            var contracts = await _contractRepo.GetAllAsync(
                predicate: c =>
                    (!contractTypeId.HasValue || c.ContractTypeId == contractTypeId.Value)
                    && (!level1CodeId.HasValue || c.Level1CodeId == level1CodeId.Value)
                    && (!procurementMethodId.HasValue || c.ProcurementMethodId == procurementMethodId.Value)
                    && (!contractStructureCatalogId.HasValue || c.ContractStructureId == contractStructureCatalogId.Value)
                    && (!partnerId.HasValue || c.PartnerId == partnerId.Value)
                    && (string.IsNullOrWhiteSpace(normalizedPartnerName)
                        || (c.Partner != null && c.Partner.Name.ToLower().Contains(normalizedPartnerName.ToLower())))
                    && (!startDateFrom.HasValue || c.StartDate >= startDateFrom.Value)
                    && (!startDateTo.HasValue || c.StartDate <= startDateTo.Value)
                    && (!endDateFrom.HasValue || c.EndDate >= endDateFrom.Value)
                    && (!endDateTo.HasValue || c.EndDate <= endDateTo.Value)
                    && (!endDate.HasValue || c.EndDate.Date == endDate.Value.Date)
                    && (!isAutoLiquidated.HasValue || c.IsAutoLiquidated == isAutoLiquidated.Value)
                    && (!isLiquidated.HasValue || (c.Status == ContractStatus.Liquidated) == isLiquidated.Value),
                include: c => c
                    .Include(x => x.SignedContent)
                    .Include(x => x.ContractItems)
                        .ThenInclude(x => x.Material)
                            .ThenInclude(x => x.UnitOfMeasure)
                    .Include(x => x.Partner),
                disableTracking: true);

            var reportsByYear = contracts
                .GroupBy(contract => contract.StartDate.Year)
                .OrderBy(group => group.Key)
                .Select(group => new ContractMaterialUnitPriceReportByYearDto
                {
                    Year = group.Key,
                    Materials = group
                        .SelectMany(contract => contract.ContractItems.Select(item => new
                        {
                            Contract = contract,
                            Item = item
                        }))
                        .GroupBy(x => new
                        {
                            x.Item.MaterialId,
                            MaterialCode = x.Item.Material?.MaterialCode,
                            MaterialName = x.Item.Material?.Name,
                            UnitOfMeasureName = x.Item.Material?.UnitOfMeasure?.Name
                        })
                        .OrderBy(x => x.Key.MaterialCode ?? string.Empty)
                        .Select(materialGroup => new ContractMaterialUnitPriceReportDto
                        {
                            MaterialCode = materialGroup.Key.MaterialCode,
                            MaterialName = materialGroup.Key.MaterialName,
                            UnitOfMeasureName = materialGroup.Key.UnitOfMeasureName,
                            Contracts = materialGroup
                                .OrderBy(x => x.Contract.ContractNumber)
                                .Select(x => new ContractUnitPriceByContractDto
                                {
                                    ContractId = x.Contract.Id,
                                    ContractCode = x.Contract.ContractNumber,
                                    ContractTitle = x.Contract.SignedContent?.Title,
                                    UnitPrice = x.Item.Price,
                                    Quantity = x.Item.Quantity,
                                    Amount = x.Item.Amount
                                })
                                .ToList()
                        })
                        .ToList()
                })
                .ToList();

            if (startDateFrom.HasValue && startDateTo.HasValue)
            {
                var yearLookup = reportsByYear.ToDictionary(x => x.Year, x => x);
                var startYear = startDateFrom.Value.Year;
                var endYear = startDateTo.Value.Year;
                var normalizedStart = Math.Min(startYear, endYear);
                var normalizedEnd = Math.Max(startYear, endYear);

                reportsByYear = Enumerable.Range(normalizedStart, normalizedEnd - normalizedStart + 1)
                    .Select(year => yearLookup.TryGetValue(year, out var existing)
                        ? existing
                        : new ContractMaterialUnitPriceReportByYearDto
                        {
                            Year = year,
                            Materials = new List<ContractMaterialUnitPriceReportDto>()
                        })
                    .ToList();
            }

            return reportsByYear;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting contract material unit price reports");
            throw;
        }
    }
}

