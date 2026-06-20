export type ContractPaymentDetail = {
  contractId: string;
  totalAmount: number;
  liquidationFilePath: string;
  payments: ContractPayment[];
};

export type ContractPayment = {
  id: string;
  contractId: string;
  periodNumber: number;
  acceptanceReportFilePaths: string[];
  invoiceFilePaths: string[];
  invoice: { numberInvoice?: string; dateInvoice?: string } | null;
  tax: Object | null;
  taxFilePaths: string[];
  paymentDate: string; // ISO 8601
  amount: number;
};

export type ContractPaymentBatchRequest = {
  contractId: string;
  items: ContractPaymentItem[];
};

export type ContractPaymentItem = {
  id?: string;
  paymentScheduleId: string;
  periodNumber?: number;
  acceptanceReportFilePaths: string[];
  invoiceFilePaths: string[];
  taxFilePaths: string[];
  paymentDate: string | null;
  amount: number;
};

export type ContractPaymentBatchResponse = {
  addedCount: number;
  updatedCount: number;
  deletedCount: number;
  failedCount: number;
  results: BatchOperationResult[];
};

export type BatchOperationResult = {
  id: string;
  operation: string;
  success: boolean;
  message: string;
};

export type PaymentFileUploadResponse = {
  filePath: string;
  fileName: string;
  fileSize: number;
  fileType: number;
};

export type ContractProgressItem = {
  id: string;
  contractItemId: string;
  materialCode: string;
  materialName: string;
  materialPrice: number;
  contractQuantity: number;
  executedQuantity: number;
  totalItemAmount: number;
};

export type ContractProgressOfSchedule = {
  id: string;
  contractId: string;
  paymentScheduleId: string;
  periodStart: string | null;
  periodEnd: string | null;
  progressTotal: number;
  contractProgressItems: ContractProgressItem[];
};

export type PaymentInstallment = {
  id: string; // paymentScheduleId
  period: number;
  periodLabel: string;
  /** Số tiền kế hoạch */
  paymentAmount: number;
  /** Số tiền thanh toán thực tế (từ contractPayments[].amount) */
  actualPaymentAmount: number;
  /** Ngày thanh toán thực tế (từ contractPayments[].paymentDate) */
  actualPaymentDate: string | null;
  /** id của contractPayment hiện tại để PUT batch update (undefined = create mới) */
  existingPaymentId?: string;
  /** Danh sách contractProgresses gắn với kỳ này (để hiển thị popover) */
  contractProgresses: ContractProgressOfSchedule[];
  progresses: ContractProgressItem[];
  progressTotal: number;
  documents: {
    acceptanceMinute: string[];
    invoice: string[];
    tax: string[];
  };
};

export type PaymentSchedule = {
  id: string;
  contractId: string;
  scheduleType: number;
  amountType: number;
  amount: number;
  paymentAmount: number;
  paymentStatus: number;
  month: number | null;
  year: number | null;
  quarter: number | null;
  fromDate: string | null;
  toDate: string | null;
  dueDate: string | null;
  days: number;
  contractPayments: ContractPayment[];
  /** Response mới: array tiến độ trong kỳ */
  contractProgresses: ContractProgressOfSchedule[];
};


export type SyncResult = {
  sourceCount: number;
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
};

// type.ts - thêm type mới
export type SyncPayload = {
  contractNumber: string;
  contractDate: string;
  sourceConnectionId: string;
};
export type MaterialUnitPriceReportContract = {
  contractId: string;
  contractCode: string;
  contractTitle: string;
  unitPrice: number;
  quantity: number;
  amount: number;
};

export type MaterialUnitPriceReportMaterial = {
  materialCode: string;
  materialName: string;
  unitOfMeasureName: string;
  contracts: MaterialUnitPriceReportContract[];
};

export type MaterialUnitPriceReportYear = {
  year: number;
  materials: MaterialUnitPriceReportMaterial[];
};

export type MaterialUnitPriceReportQuery = {
  startDateFrom?: string;
  startDateTo?: string;
};

export type GetContractReportsReq = {
  ContractTypeId?: string;
  Level1CodeId?: string;
  ProcurementMethodId?: string;
  ContractStructureCatalogId?: string;
  PartnerId?: string;
  PartnerName?: string;
  StartDateFrom?: string;
  StartDateTo?: string;
  EndDateFrom?: string;
  EndDateTo?: string;
  EndDate?: string;
  IsAutoLiquidated?: boolean;
  IsLiquidated?: boolean;
};

export type MonthData = {
  quantity: number;
  amount: number;
};

export type ExecutionData = {
  month1: MonthData; month2: MonthData; month3: MonthData;
  month4: MonthData; month5: MonthData; month6: MonthData;
  month7: MonthData; month8: MonthData; month9: MonthData;
  month10: MonthData; month11: MonthData; month12: MonthData;
  yearlyAccumulation: MonthData;
  incompletedWork: MonthData;
  estimatedExecution: MonthData;
};

export type ContractReportResponse = {
  codeLevel1: string;
  codeLevel2: string;
  codeLevel3: string;
  contractType: string;
  selectionMethod: string;
  contractFormat: string;
  contractContentName: string;
  trackingNumber: string;
  contractCode: string;
  appendixNumber: string;
  partnerName: string;
  address: string;
  taxCode: string;
  representativeName: string;
  signingDate: string;
  expiryDate: string;
  paymentTerm: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  contractValue: number;
  guaranteeValue: string;
  guaranteeTermAndBank: string;
  execution: ExecutionData;
  liquidationStatus: string;
  createdByUser: string;
  manager: string;
  receivingUnit: string;
  notes: string;
};