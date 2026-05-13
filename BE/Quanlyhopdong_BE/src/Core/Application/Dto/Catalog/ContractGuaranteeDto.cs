using Domain.Common.Enums;

namespace Application.Dto.Catalog;

public class ContractGuaranteeDto
{
    public Guid Id { get; set; }
    public GuaranteeType GuaranteeType { get; set; }
    public decimal Value { get; set; } // Giá trị tiền || % hợp đồng
    public ContractGuaranteeValueType ValueType { get; set; } // Kiểu giá trị
    public DateTimeOffset? DurationDate { get; set; } //Thời gian bảo lãnh, bảo hành, đặt cọc
    public Guid? BankAccountId { get; set; }
    public BankAccountDto? BankAccount { get; set; }
}

public class CreateContractGuaranteeDto
{
    public decimal Value { get; set; } // Giá trị tiền || % hợp đồng
    public ContractGuaranteeValueType ValueType { get; set; } // Kiểu giá trị
    public DateTimeOffset? DurationDate { get; set; } //Thời gian bảo lãnh, bảo hành, đặt cọc
    public Guid? BankAccountId { get; set; } // Tạm thời null vì DB chưa có dữ liệu
}


public class CreateContractGuaranteeListDto
{
    public CreateContractGuaranteeDto? PerformanceBondGuarantee { get; set; }
    public CreateContractGuaranteeDto? WarrantyBondGuarantee { get; set; }
    public CreateContractGuaranteeDto? DepositGuarantee { get; set; }
}
