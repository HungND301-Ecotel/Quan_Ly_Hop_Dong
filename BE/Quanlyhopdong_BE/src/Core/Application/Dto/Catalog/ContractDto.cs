using Domain.Common.Enums;
using Domain.Entities.Catalog;

namespace Application.Dto.Catalog;

public class ShortContractDto
{
    public Guid Id { get; set; }
    public bool IsDebtTrackingEnabled { get; set; }
    public string? Title { get; set; }
    public Guid? Level1CodeId { get; set; }
    public string? Level1CodeCode { get; set; }
    public string Level2Code { get; set; }
    public Guid? Level3CodeId { get; set; }
    public string? Level3Code { get; set; }
    public string ContractNumber { get; set; }
    public string AppendixNumber { get; set; } = string.Empty;
    public PaymentPlanType PaymentPlanType { get; set; } = PaymentPlanType.Monthly;
    public Guid? ContractStructureId { get; set; }
    public string ContractStructureName { get; set; } = string.Empty;
    public Guid ContractTypeId { get; set; }
    public string ContractTypeName { get; set; }
    public Guid ProcurementMethodId { get; set; }
    public string ProcurementMethodCode { get; set; }
    public string ProcurementMethodName { get; set; }
    public Guid ContractRegisterId { get; set; }
    public string ContractRegisterName { get; set; }
    public ContractFormat ContractFormat { get; set; }
    public Guid? ParentContractId { get; set; }
    public Guid? PartnerId { get; set; }
    public string? PartnerName { get; set; }
    public Guid DepartmentId { get; set; }
    public string DepartmentName { get; set; }
    public decimal? ContractValue { get; set; }
    public DateTimeOffset? StartDate { get; set; }
    public DateTimeOffset? EndDate { get; set; }
    public string Status { get; set; }
    public string? SubStatus { get; set; }
    public string? FilePath { get; set; }
    public string? SignedFilePath { get; set; }
    public string? Notes { get; set; }

    public Domain.Common.Enums.ValueType DiscountType { get; set; }
    public decimal DiscountValue { get; set; }
    public bool IsArchiveContract { get; set; }
    public List<ContractSigningFlowDto>? SigningFlows { get; set; }
    public List<ContractUserRoleDto> ContractUserRoles { get; set; } = new List<ContractUserRoleDto>();
}
public class ContractDto
{
    public Guid Id { get; set; }
    public bool IsDebtTrackingEnabled { get; set; }
    public bool IsAutoLiquidated { get; set; }
    public string? Title { get; set; }
    public Guid? Level1CodeId { get; set; }
    public string? Level1CodeCode { get; set; }
    public string Level2Code { get; set; }
    public Guid? Level3CodeId { get; set; }
    public string? Level3Code { get; set; }
    public string ContractNumber { get; set; }
    public string AppendixNumber { get; set; } = string.Empty;
    public PaymentPlanType PaymentPlanType { get; set; } = PaymentPlanType.Monthly;
    public Guid? ContractStructureId { get; set; }
    public string ContractStructureName { get; set; } = string.Empty;
    public Guid ContractTypeId { get; set; }
    public string ContractTypeName { get; set; }
    public Guid ProcurementMethodId { get; set; }
    public string ProcurementMethodCode { get; set; }
    public string ProcurementMethodName { get; set; }
    public Guid ContractRegisterId { get; set; }
    public string ContractRegisterName { get; set; }
    public ContractFormat ContractFormat { get; set; }
    public Guid? ParentContractId { get; set; }
    public string? ParentContractTitle { get; set; }
    public string? ParentContractNumber { get; set; }
    public Guid? PartnerId { get; set; }
    public string? PartnerName { get; set; }
    public PartnerDto? PartnerDetail { get; set; }
    public Guid DepartmentId { get; set; }
    public string DepartmentName { get; set; }
    public decimal? ContractValue { get; set; }
    public DateTimeOffset? StartDate { get; set; }
    public DateTimeOffset? EndDate { get; set; }
    public string Status { get; set; }
    public string? SubStatus { get; set; }
    public string? ContractName { get; set; }
    public string? FilePath { get; set; }
    public string? SignedFilePath { get; set; }
    public string? Notes { get; set; }

    public Domain.Common.Enums.ValueType DiscountType { get; set; }
    public decimal DiscountValue { get; set; }

    public List<ContractSigningFlowDto>? SigningFlows { get; set; }
    public List<ContractAttachmentDto>? Attachments { get; set; }
    public List<ContractUserRoleDto> ContractUserRoles { get; set; } = new List<ContractUserRoleDto>();
    public List<PaymentScheduleDto> PaymentSchedules { get; set; } = new List<PaymentScheduleDto>();
    public List<ContractItemDto> ContractItems { get; set; } = new List<ContractItemDto>();
    public List<ContractItemDto> ContractOtherItems { get; set; } = new List<ContractItemDto>();
    public List<ContractGuaranteeDto> ContractGuarantee { get; set; }
    public List<ChildContractRelationshipDto> ChildContractRelationships { get; set; } = new List<ChildContractRelationshipDto>();
}

public class ChildContractRelationshipDto
{
    public Guid ChildContractId { get; set; }
    public string ChildContractTitle { get; set; } = string.Empty;
    public string ChildContractNumber { get; set; } = string.Empty;
    public ContractFormat ChildContractFormat { get; set; }
    public ParentContractRelationType RelationType { get; set; }
}

public class ContractTypeDto
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string Code { get; set; }
    public string Description { get; set; }
}

public class CreateContractTypeDto
{
    public string Name { get; set; }
    public string Code { get; set; }
    public string Description { get; set; }
}
public class CreateContractDto
{
    public bool IsDebtTrackingEnabled { get; set; } = true;
    public bool IsAutoLiquidated { get; set; } = false;
    public Guid? Level1CodeId { get; set; }
    public string Level2Code { get; set; }
    public Guid? Level3CodeId { get; set; }
    public string ContractNumber { get; set; }
    public string AppendixNumber { get; set; } = string.Empty;
    public Guid? ContractStructureId { get; set; }
    public Guid ProcurementMethodId { get; set; }
    public Guid ContractTypeId { get; set; }
    public Guid ContractRegisterId { get; set; }
    public ContractFormat ContractFormat { get; set; }
    public CreateParentContractRelationshipDto? ParentRelationship { get; set; }

    public Guid? PartnerId { get; set; }
    public Guid DepartmentId { get; set; }
    public decimal? ContractValue { get; set; }
    public DateTimeOffset StartDate { get; set; }
    public DateTimeOffset EndDate { get; set; }
    public string? Notes { get; set; }
    public string ContractFilePath { get; set; }

    public Domain.Common.Enums.ValueType DiscountType { get; set; }
    public decimal DiscountValue { get; set; }

    public List<CreateContractAttachmentDto> AttachmentFiles { get; set; } = new List<CreateContractAttachmentDto>();
    public List<CreateContractSigningFlowDto>? SigningFlows { get; set; }
    public CreateContractUserRoleDto ContractUserRoles { get; set; }
    public CreatePaymentScheduleListDto? PaymentSchedules { get; set; }
    public List<CreateContractItemDto> ContractItems { get; set; } = new List<CreateContractItemDto>();
    public CreateContractGuaranteeListDto? ContractGuarantee { get; set; }
    public List<CreateChildContractRelationshipDto>? ChildRelationships { get; set; }
}

public class UpdateContractDto
{
    public bool IsDebtTrackingEnabled { get; set; } = true;
    public bool IsAutoLiquidated { get; set; } = false;
    public Guid? Level1CodeId { get; set; }
    public string Level2Code { get; set; }
    public Guid? Level3CodeId { get; set; }
    public string ContractNumber { get; set; }
    public string AppendixNumber { get; set; } = string.Empty;
    public Guid? ContractStructureId { get; set; }
    public Guid ProcurementMethodId { get; set; }
    public Guid ContractTypeId { get; set; }
    public Guid ContractRegisterId { get; set; }
    public ContractFormat ContractFormat { get; set; }
    public CreateParentContractRelationshipDto? ParentRelationship { get; set; }
    public Guid? PartnerId { get; set; }
    public Guid DepartmentId { get; set; }
    public decimal? ContractValue { get; set; }
    public DateTimeOffset StartDate { get; set; }
    public DateTimeOffset EndDate { get; set; }
    public string? Notes { get; set; }
    public string ContractFilePath { get; set; }

    public Domain.Common.Enums.ValueType DiscountType { get; set; }
    public decimal DiscountValue { get; set; }

    public List<CreateContractAttachmentDto> AttachmentFiles { get; set; } = new List<CreateContractAttachmentDto>();
    public List<UpdateContractSigningFlowDto>? SigningFlows { get; set; }
    public CreateContractUserRoleDto ContractUserRoles { get; set; }
    public CreatePaymentScheduleListDto? PaymentSchedules { get; set; }
    public List<CreateContractItemDto> ContractItems { get; set; } = new List<CreateContractItemDto>();
    public CreateContractGuaranteeListDto? ContractGuarantee { get; set; }
    public List<CreateChildContractRelationshipDto>? ChildRelationships { get; set; }
}

public class ContractSigningFlowDto
{
    public Guid Id { get; set; }
    public Guid ContractId { get; set; }
    public Guid UserId { get; set; }
    public string UserName { get; set; }
    public string FullName { get; set; }
    public Guid DepartmentId { get; set; }
    public string DepartmentName { get; set; }
    public UserRole? Role { get; set; }
    public int SequenceOrder { get; set; }
    public SignatureType SignatureType { get; set; }
    public decimal? PositionX { get; set; }
    public decimal? PositionY { get; set; }
    public int? PageNumber { get; set; }
    public decimal? Width { get; set; }
    public decimal? Height { get; set; }
    public string Status { get; set; }
    public DateTimeOffset? SignedAt { get; set; }
    public string? RejectionReason { get; set; }
    public string? RevisionNotes { get; set; }
}

public class CreateParentContractRelationshipDto
{
    public Guid ParentContractId { get; set; }
    public ParentContractRelationType RelationType { get; set; }
}

public class CreateChildContractRelationshipDto
{
    public Guid ChildContractId { get; set; }
    public ParentContractRelationType RelationType { get; set; }
}

public class UpdateContractSigningFlowDto : CreateContractSigningFlowDto
{
    public Guid Id { get; set; } = Guid.Empty;
}

public class CreateContractSigningFlowDto
{
    public Guid UserId { get; set; }
    public int SequenceOrder { get; set; }
    public SignatureType SignatureType { get; set; }
    public decimal? PositionX { get; set; }
    public decimal? PositionY { get; set; }
    public int? PageNumber { get; set; }
    public decimal? Width { get; set; }
    public decimal? Height { get; set; }
}

public class ContractSigningFlowPositionDto
{
    public decimal PositionX { get; set; }
    public decimal PositionY { get; set; }
    public int PageNumber { get; set; }
    public decimal Width { get; set; }
    public decimal Height { get; set; }
}

public class ContractAttachmentDto
{
    public Guid Id { get; set; }
    public Guid ContractId { get; set; }
    public string FileName { get; set; }
    public string FilePath { get; set; }
    public long? FileSize { get; set; }
    public string? FileType { get; set; }
    public string? Description { get; set; }
}

public class CreateContractAttachmentDto
{
    public string FileName { get; set; }
    public string FilePath { get; set; }
    public long? FileSize { get; set; }
    public string? FileType { get; set; }
}

public class CreateContractUserRoleDto
{
    public Guid DraftingOfficerUserId { get; set; }
    public Guid ManagerUserId { get; set; }
    public Guid CoordinatorUserId { get; set; }
    public Guid ReceivingOfficerUserId { get; set; }

    public List<ContractUserRole> ToDomain(Guid contractId)
    {
        var roles = new List<ContractUserRole>();

        if (DraftingOfficerUserId != Guid.Empty)
        {
            roles.Add(ContractUserRole.Create(DraftingOfficerUserId, ContractRole.DraftingOfficer));
        }

        if (ManagerUserId != Guid.Empty)
        {
            roles.Add(ContractUserRole.Create(ManagerUserId, ContractRole.Manager));
        }

        if (CoordinatorUserId != Guid.Empty)
        {
            roles.Add(ContractUserRole.Create(CoordinatorUserId, ContractRole.Coordinator));
        }

        if (ReceivingOfficerUserId != Guid.Empty)
        {
            roles.Add(ContractUserRole.Create(ReceivingOfficerUserId, ContractRole.ReceivingOfficer));
        }

        return roles;
    }
}

public class ContractUserRoleDto
{
    public Guid Id { get; set; }
    public Guid ContractId { get; set; }
    public Guid UserId { get; set; }
    public string Fullname { get; set; }
    public UserRole? UserRole { get; set; }
    public Guid DepartmentId { get; set; }
    public string DepartmentName { get; set; }
    public ContractRole Role { get; set; }
}

/// <summary>
/// DTO cho việc chuẩn bị dữ liệu gia hạn hợp đồng
/// Dùng để pre-fill form tạo hợp đồng mới từ hợp đồng cũ
/// </summary>
public class PrepareExtensionDto
{
    public Guid OriginalContractId { get; set; }
    public string OriginalContractNumber { get; set; }
    public string SuggestedAppendixNumber { get; set; } // GH01, GH02...
    
    // Thông tin cơ bản để copy (user có thể sửa)
    public bool IsDebtTrackingEnabled { get; set; } = true;
    public bool IsAutoLiquidated { get; set; } = false;
    public Guid? Level1CodeId { get; set; }
    public string Level2Code { get; set; }

    public Guid? Level3CodeId { get; set; }
    public Guid? ContractStructureId { get; set; }
    public string ContractStructureName { get; set; } = string.Empty;
    public Guid ProcurementMethodId { get; set; }
    public Guid ContractTypeId { get; set; }
    public Guid ContractRegisterId { get; set; }
    public ContractFormat ContractFormat { get; set; }
    public Guid? PartnerId { get; set; }
    public Guid DepartmentId { get; set; }
    public decimal? ContractValue { get; set; }
    
    // Ngày cũ - chỉ để tham khảo, user phải chọn ngày mới
    public DateTimeOffset OriginalStartDate { get; set; }
    public DateTimeOffset OriginalEndDate { get; set; }
    
    public string? Notes { get; set; }
    public Domain.Common.Enums.ValueType DiscountType { get; set; }
    public decimal DiscountValue { get; set; }
    
    // Contract items để copy (chỉ có MaterialId và Quantity)
    public List<CreateContractItemDto> ContractItems { get; set; } = new List<CreateContractItemDto>();
}