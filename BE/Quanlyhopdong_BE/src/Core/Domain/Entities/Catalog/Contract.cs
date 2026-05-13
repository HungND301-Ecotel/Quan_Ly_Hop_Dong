using System.ComponentModel.DataAnnotations.Schema;
using Domain.Common.Contracts;
using Domain.Common.Enums;
using Domain.Entities.Category;

namespace Domain.Entities.Catalog;

public class Contract : AuditableEntity<Guid>
{
    public bool IsDebtTrackingEnabled { get; protected set; } = true;
    public bool IsAutoLiquidated { get; protected set; } = false;
    public Guid? Level1CodeId { get; protected set; }
    public string Level2Code { get; protected set; } = string.Empty;
    public Guid? Level3CodeId { get; protected set; }
    public Guid? SignedContentId { get; protected set; }
    public string ContractNumber { get; protected set; } = string.Empty;
    public string AppendixNumber { get; protected set; } = string.Empty;
    public Guid? ContractStructureId { get; protected set; }
    public ScheduleType? ScheduleType { get; set; }
    public Guid ProcurementMethodId { get; protected set; }
    public Guid ContractTypeId { get; protected set; }
    public Guid ContractRegisterId { get; protected set; }
    public ContractFormat ContractFormat { get; protected set; }
    public Guid? PartnerId { get; protected set; }
    public Guid DepartmentId { get; protected set; }
    public decimal? ContractValue { get; protected set; }
    public DateTimeOffset StartDate { get; protected set; }
    public DateTimeOffset EndDate { get; protected set; }
    public ContractStatus Status { get; protected set; } = ContractStatus.Draft;
    public ContractSubStatus? SubStatus { get; protected set; } = ContractSubStatus.SavedDraft;
    public string? FilePath { get; protected set; }
    public string? SignedFilePath { get; protected set; }
    public string? LiquidationFilePath { get; protected set; }
    public string? Notes { get; protected set; }
    public Common.Enums.ValueType DiscountType { get; protected set; } = Common.Enums.ValueType.Percent;
    public decimal DiscountValue { get; protected set; } = 0;

    // Navigation Properties
    [ForeignKey("ContractTypeId")]
    public virtual ContractType ContractType { get; protected set; } = null!;

    [ForeignKey("PartnerId")]
    public virtual Partner? Partner { get; protected set; }

    [ForeignKey("DepartmentId")]
    public virtual Department Department { get; protected set; } = null!;

    [ForeignKey("ContractRegisterId")]
    public virtual ContractRegister ContractRegister { get; protected set; } = null!;

    [ForeignKey("ProcurementMethodId")]
    public virtual ProcurementMethod ProcurementMethod { get; protected set; } = null!;

    [ForeignKey("Level1CodeId")]
    public virtual Level1Code? Level1Code { get; protected set; } = null!;

    [ForeignKey("Level3CodeId")]
    public virtual Level3Code? Level3Code { get; protected set; }

    [ForeignKey("SignedContentId")]
    public virtual SignedContent? SignedContent { get; protected set; }

    [ForeignKey("ContractStructureId")]
    public virtual ContractStructureCatalog? ContractStructureCatalog { get; protected set; }

    private IList<ContractAttachment> _contractAttachments = new List<ContractAttachment>();
    public virtual IReadOnlyCollection<ContractAttachment> ContractAttachments => _contractAttachments.AsReadOnly();

    private IList<ContractSigningFlow> _contractSigningFlows = new List<ContractSigningFlow>();
    public virtual IReadOnlyCollection<ContractSigningFlow> ContractSigningFlows => _contractSigningFlows.AsReadOnly();

    private IList<PaymentSchedule.PaymentSchedule> _paymentSchedules = new List<PaymentSchedule.PaymentSchedule>();
    public virtual IReadOnlyCollection<PaymentSchedule.PaymentSchedule> PaymentSchedules => _paymentSchedules.AsReadOnly();

    private IList<ContractUserRole> _contractUserRoles = new List<ContractUserRole>();
    public virtual IReadOnlyCollection<ContractUserRole> ContractUserRoles => _contractUserRoles.AsReadOnly();

    private IList<ContractItem> _contractItems = new List<ContractItem>();
    public virtual IReadOnlyCollection<ContractItem> ContractItems => _contractItems.AsReadOnly();

    private IList<ContractGuarantee> _contractGuarantees = new List<ContractGuarantee>();
    public virtual IReadOnlyCollection<ContractGuarantee> ContractGuarantees => _contractGuarantees.AsReadOnly();

    private IList<ContractProgress.ContractProgress> _contractProgresses = new List<ContractProgress.ContractProgress>();
    public virtual IReadOnlyCollection<ContractProgress.ContractProgress> ContractProgresses => _contractProgresses.AsReadOnly();

    private IList<ContractPayment> _contractPayments = new List<ContractPayment>();
    public virtual IReadOnlyCollection<ContractPayment> ContractPayments => _contractPayments.AsReadOnly();

    // Quan hệ cha-con với ContractRelationship
    private IList<ContractRelationship> _asParentRelationships = new List<ContractRelationship>();
    public virtual IReadOnlyCollection<ContractRelationship> AsParentRelationships => _asParentRelationships.AsReadOnly();

    private IList<ContractRelationship> _asChildRelationships = new List<ContractRelationship>();
    public virtual IReadOnlyCollection<ContractRelationship> AsChildRelationships => _asChildRelationships.AsReadOnly();

    // Helper properties
    public IEnumerable<ContractRelationship> GetLinkedParents() =>
        AsChildRelationships.Where(r => r.RelationType == ParentContractRelationType.LinkedContract);

    public IEnumerable<ContractRelationship> GetRenewalParents() =>
        AsChildRelationships.Where(r => r.RelationType == ParentContractRelationType.RenewalContract);

    public IEnumerable<ContractRelationship> GetLinkedChildren() =>
        AsParentRelationships.Where(r => r.RelationType == ParentContractRelationType.LinkedContract);

    public IEnumerable<ContractRelationship> GetRenewalChildren() =>
        AsParentRelationships.Where(r => r.RelationType == ParentContractRelationType.RenewalContract);

    public static Contract Create(
        bool isDebtTrackingEndable,
        bool isAutoLiquidated,
        Guid? level1CodeId,
        string level2Code,
        Guid? level3CodeId,
        string contractNumber,
        Guid? contractStructureId,
        Guid contractTypeId,
        Guid? partnerId,
        Guid departmentId,
        Guid procurementMethodId,
        Guid contractRegisterId,
        decimal? contractValue,
        DateTimeOffset startDate,
        DateTimeOffset endDate,
        string? filePath,
        string? notes,
        ContractFormat contractFormat,
        Common.Enums.ValueType discountType,
        ScheduleType? scheduleType,
        decimal discountValue = 0,
        string appendixNumber = "")
    {
        if (startDate.Date > endDate.Date)
        {
            throw new ArgumentException("StartDate cannot higher than EndDate");
        }

        return new Contract
        {
            IsDebtTrackingEnabled = isDebtTrackingEndable,
            IsAutoLiquidated = isAutoLiquidated,
            ContractTypeId = contractTypeId,
            PartnerId = partnerId,
            DepartmentId = departmentId,
            ContractValue = contractValue,
            StartDate = startDate,
            EndDate = endDate,
            FilePath = filePath,
            Notes = notes,
            ContractFormat = contractFormat,
            Level1CodeId = level1CodeId,
            Level2Code = level2Code,
            Level3CodeId = level3CodeId,
            ContractNumber = contractNumber,
            ContractStructureId = contractStructureId,
            ProcurementMethodId = procurementMethodId,
            ContractRegisterId = contractRegisterId,
            AppendixNumber = appendixNumber,
            DiscountType = discountType,
            DiscountValue = discountValue,
            ScheduleType = scheduleType
        };
    }

    public void Update(
        bool isDebtTrackingEndable,
        bool isAutoLiquidated,
        Guid? level1CodeId,
        string level2Code,
        Guid? level3CodeId,
        string contractNumber,
        Guid? contractStructureId,
        Guid contractTypeId,
        Guid? partnerId,
        Guid departmentId,
        Guid procurementMethodId,
        Guid contractRegisterId,
        decimal? contractValue,
        DateTimeOffset startDate,
        DateTimeOffset endDate,
        string? filePath,
        string? notes,
        ContractFormat contractFormat,
        PaymentPlanType paymentPlanType,
        Common.Enums.ValueType discountType,
        ScheduleType? scheduleType,
        decimal discountValue = 0,
        string appendixNumber = "")
    {
        if (startDate.Date > endDate.Date)
        {
            throw new ArgumentException("StartDate cannot higher than EndDate");
        }

        IsDebtTrackingEnabled = isDebtTrackingEndable;
        IsAutoLiquidated = isAutoLiquidated;
        ContractTypeId = contractTypeId;
        PartnerId = partnerId;
        DepartmentId = departmentId;
        ContractValue = contractValue;
        StartDate = startDate;
        EndDate = endDate;
        FilePath = filePath;
        Notes = notes;
        ContractFormat = contractFormat;
        Level1CodeId = level1CodeId;
        Level2Code = level2Code;
        Level3CodeId = level3CodeId;
        ContractNumber = contractNumber;
        ContractStructureId = contractStructureId;
        ProcurementMethodId = procurementMethodId;
        ContractRegisterId = contractRegisterId;
        AppendixNumber = appendixNumber;
        DiscountType = discountType;
        DiscountValue = discountValue;
        ScheduleType = scheduleType;
    }

    public decimal GetContractItemTotalPrice()
    {
        if (ContractFormat == ContractFormat.TemplateSell || ContractFormat == ContractFormat.TemplateBuy)
        {
            return 0;
        }

        var contractItemsTotal = ContractItems.Sum(c => c.Amount);

        var totalAfterDiscount = DiscountType switch
        {
            Common.Enums.ValueType.Percent => contractItemsTotal * (1 - DiscountValue / 100),
            Common.Enums.ValueType.Amount => contractItemsTotal - DiscountValue,
            _ => contractItemsTotal
        };

        return totalAfterDiscount;
    }

    public void SetStatus(ContractStatus status) => Status = status;
    public void SetSubStatus(ContractSubStatus? subStatus) => SubStatus = subStatus;
    public void SetSignedFilePath(string? path) => SignedFilePath = path;
    public void SetFilePath(string? filePath) => FilePath = filePath;
    public void SetLiquidationFilePath(string? filePath) => LiquidationFilePath = filePath;
    public void SetSignedContentId(Guid? signedContentId) => SignedContentId = signedContentId;

    public void AddAttachment(ContractAttachment attachment) => _contractAttachments.Add(attachment);
    public void RemoveAttachment(ContractAttachment attachment) => _contractAttachments.Remove(attachment);
    public void AddFlow(ContractSigningFlow flow) => _contractSigningFlows.Add(flow);

    public void AddContractUserRoles(IList<ContractUserRole> contractUserRoles)
    {
        foreach (var item in contractUserRoles)
        {
            _contractUserRoles.Add(item);
        };
    }

    public void ClearContractUserRoles(List<ContractUserRole> ls)
    {
        foreach (var item in ls)
        {
            _contractUserRoles.Remove(item);
        }
    }

    public void AddPaymentSchedules(IList<PaymentSchedule.PaymentSchedule> paymentSchedules)
    {
        foreach (var item in paymentSchedules)
        {
            _paymentSchedules.Add(item);
        }
    }

    public void ClearPaymentSchedule() => _paymentSchedules.Clear();

    public void ClearPaymentSchedule(List<PaymentSchedule.PaymentSchedule> ls)
    {
        foreach (var item in ls)
        {
            _paymentSchedules.Remove(item);
        }
    }

    public void AddContractItem(IList<ContractItem> contractItems)
    {
        foreach (var item in contractItems)
        {
            _contractItems.Add(item);
        }
    }

    public void ClearContractItem() => _contractItems.Clear();

    public void AddContractGuarantee(ContractGuarantee contractGuarantee) =>
        _contractGuarantees.Add(contractGuarantee);

    public void AddContractProgress(ContractProgress.ContractProgress progress) =>
        _contractProgresses.Add(progress);

    public void AddContractProgresses(IList<ContractProgress.ContractProgress> progresses)
    {
        foreach (var item in progresses)
        {
            _contractProgresses.Add(item);
        }
    }

    public void RemoveContractProgress(ContractProgress.ContractProgress progress) =>
        _contractProgresses.Remove(progress);

    public void ClearContractProgresses() => _contractProgresses.Clear();

    /// <summary>
    /// Thêm quan hệ cha (contract này là cha)
    /// </summary>
    public void AddAsParentRelationship(ContractRelationship relationship) =>
        _asParentRelationships.Add(relationship);

    /// <summary>
    /// Thêm quan hệ con (contract này là con)
    /// </summary>
    public void AddAsChildRelationship(ContractRelationship relationship) =>
        _asChildRelationships.Add(relationship);

    /// <summary>
    /// Xóa quan hệ cha
    /// </summary>
    public void RemoveAsParentRelationship(ContractRelationship relationship) =>
        _asParentRelationships.Remove(relationship);

    /// <summary>
    /// Xóa quan hệ con
    /// </summary>
    public void RemoveAsChildRelationship(ContractRelationship relationship) =>
        _asChildRelationships.Remove(relationship);

    /// <summary>
    /// Lấy lũy kế tiến độ theo năm
    /// </summary>
    public (decimal TotalQuantity, decimal TotalAmount) GetYearlyProgressAccumulation(int year) =>
        ContractProgress.ContractProgress.GetYearlyAccumulation(ContractProgresses, year);

    /// <summary>
    /// Tính tổng khối lượng/giá trị dở dang
    /// </summary>
    public (decimal RemainingQuantity, decimal RemainingAmount) GetTotalWorkInProgress()
    {
        var totalExecutedQuantity = ContractProgresses
            .SelectMany(p => p.ProgressItems)
            .Sum(item => item.ExecutedQuantity);

        var totalExecutedAmount = ContractProgresses
            .SelectMany(p => p.ProgressItems)
            .Sum(item => item.ExecutedAmount);

        var contractTotalQuantity = ContractItems.Sum(x => x.Quantity);
        var contractTotalAmount = ContractItems.Sum(x => x.Amount);

        return (
            RemainingQuantity: contractTotalQuantity - totalExecutedQuantity,
            RemainingAmount: contractTotalAmount - totalExecutedAmount
        );
    }

    /// <summary>
    /// Get total payment amount
    /// </summary>
    public decimal GetTotalPaymentAmount() => ContractPayments.Sum(p => p.Amount);
}