export enum GuaranteeType {
  PerformanceBond = 1,
  WarrantyBond = 2, // Bảo lãnh bảo hành
  Deposit = 3, // Đặt cọc
}

export enum DurationUnit {
  Day = 1,
  Month = 2,
  Year = 3,
}

export enum ContractGuaranteeValueType {
  Percentage,
  Ammount,
}

export enum PaymentPlanType {
  Monthly,
  Quarterly,
  Yearly,
  Stage,
  LumpSum,
}

export enum PeriodType {
  Month,
  Quarter,
  Year,
  Stage,
  LumpSum,
}

export enum ContractRole {
  DraftingOfficer, // Người soạn hợp đồng
  Manager, // Người quản lý hợp đồng
  Coordinator, // Người phối hợp
  ReceivingOfficer, // Người nhận hồ sơ
}

export const PaymentSchedule = {};
