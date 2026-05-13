namespace Application.Dto.Catalog;

/// <summary>
/// DTO for comprehensive contract management report (XDCB report)
/// </summary>
public class ContractReportDto
{
    #region 1. CONTRACT CLASSIFICATION INFORMATION
    
    // Code Level I
    public string? CodeLevel1 { get; set; }
    
    // Code Level II
    public string? CodeLevel2 { get; set; }
    
    // Code Level III
    public string? CodeLevel3 { get; set; }
    
    // Contract type
    public string? ContractType { get; set; }
    
    #endregion

    #region 2. GENERAL CONTRACT INFORMATION
    
    // Selection method for contractor/supplier
    public string? SelectionMethod { get; set; }
    
    // Contract format
    public string? ContractFormat { get; set; }
    
    // Contract content name
    public string? ContractContentName { get; set; }
    
    // Contract tracking number (e.g. "Ledger 03-2025")
    public string? TrackingNumber { get; set; }
    
    // Contract signature number (e.g. "01/HĐTV-TUB")
    public string? ContractCode { get; set; }
    
    // Appendix contract signature number (if any)
    public string? AppendixNumber { get; set; }
    
    #endregion

    #region 3. PARTNER / CUSTOMER INFORMATION
    
    // Partner/customer name
    public string? PartnerName { get; set; }
    
    // Address
    public string? Address { get; set; }
    
    // Tax code
    public string? TaxCode { get; set; }
    
    // Legal representative person
    public string? RepresentativeName { get; set; }
    
    #endregion

    #region 4. TIME & PAYMENT
    
    // Contract signing date
    public DateTime? SigningDate { get; set; }
    
    // Contract expiry date
    public DateTime? ExpiryDate { get; set; }
    
    // Payment form (e.g. "monthly", "quarterly", "lump sum", "stage")
    public string? PaymentTerm { get; set; }
    
    #endregion

    #region 5. CONTRACT VALUE
    
    // Quantity (if any)
    public decimal? Quantity { get; set; }
    
    // Unit price (if any)
    public decimal? UnitPrice { get; set; }
    
    // Amount (if any)
    public decimal? Amount { get; set; }
    
    // Contract value after tax (total)
    public decimal? ContractValue { get; set; }
    
    // Guarantee/warranty/deposit value (% of contract)
    public string? GuaranteeValue { get; set; }
    
    // Guarantee duration and bank
    public string? GuaranteeTermAndBank { get; set; }
    
    #endregion

    #region 6. CONTRACT EXECUTION STATUS (By each month, year 2025)
    
    public MonthlyExecutionDto? Execution { get; set; }
    
    #endregion

    #region 7. CONTRACT MANAGEMENT & COMPLETION
    
    // Liquidation status (e.g. "R" = liquidated)
    public string? LiquidationStatus { get; set; }
    
    // Person who drafted/saved contract file
    public string? CreatedByUser { get; set; }
    
    // Person who directly manages contract
    public string? Manager { get; set; }
    
    // Unit/person who receives contract, appendix, liquidation
    public string? ReceivingUnit { get; set; }
    
    // Notes, issues
    public string? Notes { get; set; }
    
    #endregion
}

/// <summary>
/// Monthly execution data for contract
/// </summary>
public class MonthlyExecutionDto
{
    public ExecutionPeriodDto? Month1 { get; set; }
    public ExecutionPeriodDto? Month2 { get; set; }
    public ExecutionPeriodDto? Month3 { get; set; }
    public ExecutionPeriodDto? Month4 { get; set; }
    public ExecutionPeriodDto? Month5 { get; set; }
    public ExecutionPeriodDto? Month6 { get; set; }
    public ExecutionPeriodDto? Month7 { get; set; }
    public ExecutionPeriodDto? Month8 { get; set; }
    public ExecutionPeriodDto? Month9 { get; set; }
    public ExecutionPeriodDto? Month10 { get; set; }
    public ExecutionPeriodDto? Month11 { get; set; }
    public ExecutionPeriodDto? Month12 { get; set; }
    
    // Yearly accumulation
    public ExecutionPeriodDto? YearlyAccumulation { get; set; }
    
    // Incomplete work value/quantity
    public ExecutionPeriodDto? IncompletedWork { get; set; }
    
    // Estimated contract execution
    public ExecutionPeriodDto? EstimatedExecution { get; set; }
}

/// <summary>
/// Execution data for a specific period
/// </summary>
public class ExecutionPeriodDto
{
    // Quantity
    public decimal? Quantity { get; set; }
    
    // Amount
    public decimal? Amount { get; set; }
}
