namespace Domain.Common.Enums;

/// <summary>
/// Vai trò người dùng trong hệ thống
/// </summary>
public enum UserRole
{
    Admin,
    Business,
    BusinessManager,
    BusinessAssistantManager,
    Sales,
    SalesManager,
    SalesAssistantManager,
    Legal,
    LegalManager,
    LegalAssistantManager,
    Director,
    Accountant,
    AccountantManager,
    AccountantAssistantManager
}

/// <summary>
/// Trạng thái chính của hợp đồng
/// </summary>
public enum ContractStatus
{
    RequiresRevision,
    Draft,              // Soạn thảo
    PendingApproval,    // Chờ phê duyệt
    Active,             // Hiệu lực
    Expired,            // Hết hạn
    Liquidated,         // Thanh lý
    Cancelled,          // Hủy
    Archive             //lưu trữ
}

/// <summary>
/// Trạng thái phụ chi tiết của hợp đồng
/// </summary>
public enum ContractSubStatus
{
    // DRAFT
    SavedDraft,         // Lưu nháp

    // PENDING_APPROVAL
    AwaitingSigning,    // Chờ nội bộ ký
    Rejected,
    WaitPartnerSign,    // Chờ đối tác ký

    // ACTIVE
    InProgress,         // Đang thực hiện
    InPayment,        // Dang thanh toán
    InAcceptance,     // Đang nghiem thu
    PendingLiquidation, // Chờ thanh lý
    Paused,               // tam dung

    // EXPIRED
    NearExpiry,         // Sắp hết hạn
    Overdue,            // Đã quá hạn
    ExtensionProposed,  // Chờ gia hạn

    // LIQUIDATED
    LiquidatedDone,     // Đã thanh lý
    AutoLiquidated,     // Đã tự thanh lý

    // CANCELLED
    CancelledBeforeEffective,          // Huy truoc hieu luc
    TerminatedEarly,            // Huy dang thuc hien
    Closed,           //dong hop dong

    // ACTIVE (future start date)
    NotStarted,       // Chưa thực hiện

    // ARCHIVE
    ArchivedAfterLiquidation,    // Lưu trữ sau thanh lý
    ArchivedAfterCancellation,     // Lưu trữ sau hủy

    // EXPIRED (dedicated)
    ExpiredMissingAcceptance,      // Hết hạn - chưa nghiệm thu
    ExpiredMissingPayment,         // Hết hạn - chưa thanh toán
    ExpiredMissingLiquidation      // Hết hạn - chưa thanh lý
}
public enum ParentContractRelationType
{
    LinkedContract,  // Hợp đồng liên kết
    RenewalContract  // Hợp đồng gia hạn
}

/// <summary>
/// Loại chữ ký
/// </summary>
public enum SignatureType
{
    Handwritten,    // Ký nhẩy
    Normal,         // Ký thường
    Digital,        // Ký số
    CA
}

/// <summary>
/// Trạng thái ký trong flow
/// </summary>
public enum SigningFlowStatus
{
    RequiresRevision,
    Pending,    // Chờ ký
    Signed,     // Đã ký
    Rejected,   // Từ chối
    Skipped     // Bỏ qua
}

/// <summary>
/// Mã quyền hành động
/// </summary>
public enum PermissionCode
{
    Create,
    Read,
    Update,
    Delete,
    Approve,
    Export
}

/// <summary>
/// Loại đối tác
/// </summary>
public enum PartnerType
{
    Supplier,   // Nhà cung cấp
    Customer,   // Khách hàng
    Both        // Cả hai
}

/// <summary>
/// Trạng thái thanh toán
/// </summary>
public enum PaymentStatus
{
    Unpaid,     // Chưa thanh toán
    Paid,       // Đã thanh toán
}

/// <summary>
/// Phương thức thanh toán
/// </summary>
public enum PaymentMethod
{
    BankTransfer,   // Chuyển khoản
    Cash,           // Tiền mặt
    Check           // Séc
}

/// <summary>
/// Trạng thái nghiệm thu
/// </summary>
public enum AcceptanceStatus
{
    Pending,    // Chờ nghiệm thu
    Completed,  // Đã hoàn thành
    Delayed,    // Trễ hạn
    Cancelled   // Đã hủy
}

/// <summary>
/// Loại thông báo
/// </summary>
public enum NotificationType
{
    ContractCreated,    // Hợp đồng được tạo mới
    ContractReject,
    ContractEdited,     // Hợp đồng bị chỉnh sửa
    SigningDue,         // Sắp đến hạn ký
    SigningTurn,
    ContractSigned,
    RevisionRequested,
    PaymentDue,         // Sắp đến hạn thanh toán
    ContractExpiring,   // Hợp đồng sắp hết hạn
    AcceptanceDue       // Sắp đến lịch nghiệm thu
}

/// <summary>
/// Mức độ ưu tiên thông báo
/// </summary>
public enum NotificationPriority
{
    Low,
    Normal,
    High,
    Urgent
}

/// <summary>
/// Loại cấu hình thông báo
/// </summary>
public enum NotificationEventType
{
    ContractExpiring,           // Hợp đồng sắp hết hạn
    SignatureOverdue,           // Quá hạn ký
    PaymentDue,                 // Sắp đến kỳ thanh toán
    AcceptanceDue,              // Lịch nghiệm thu
    ContractExpirationSoon,     // Hợp đồng sắp hết hiệu lực
    ApprovalRequired            // Đến lượt phê duyệt
}

/// <summary>
/// Hành động trong audit log
/// </summary>
public enum AuditAction
{
    Create,
    Update,
    Delete,
    Approve,
    Reject,
    Sign,
    Cancel
}

/// <summary>
/// Loại entity trong audit log
/// </summary>
public enum EntityType
{
    Contract,
    Payment,
    User,
    Permission,
    Department,
    Partner
}

/// <summary>
/// Hành động trong hợp đồng
/// </summary>
public enum ContractAction
{
    Approve,
    Reject,
    RequestRevision,
    Created,
    SubmittedForApproval
}

/// <summary>
/// Loại forrmat hợp đồng
/// </summary>
public enum ContractFormat
{
    TemplateBuy,
    TemplateSell,
    EconomicBuy,
    EconomicSell
}

public enum PaymentPlanType
{
    Monthly,
    Quarterly,
    Yearly,
    Stage,
    LumpSum
}

public enum ScheduleType
{
    Monthly,
    Quarterly,
    Yearly,
    Stage,
    LumpSum
}

public enum ContractRole
{
    DraftingOfficer,  // Người soạn hợp đồng
    Manager,          // Người quản lý hợp đồng
    Coordinator,      // Người phối hợp
    ReceivingOfficer  // Người nhận hồ sơ
}

public enum GuaranteeType
{
    PerformanceBond = 1,   // Bảo lãnh
    WarrantyBond = 2,      // Bảo hành
    Deposit = 3           // Đặt cọc
}

public enum DurationUnit
{
    Day = 1,
    Month = 2,
    Year = 3
}

public enum ContractGuaranteeValueType
{
    Percentage,
    Ammount
}

public enum ValueType
{
    Percent,
    Amount
}