export type ContractProgressDetail = {
  fromDate: string;
  toDate: string;
  total: number;
  contractProgresses: ContractProgress[];
  isHasValue?: boolean;
  isHasMaterial?: boolean;
};

export type ContractProgress = {
  id: string;
  contractId: string;
  paymentScheduleId?: string;
  periodStart: string;
  periodEnd: string;
  progressTotal: number;
  contractProgressItems: ContractItem[];
  contractPaymentId?: string | null;
  numberInvoice?: string | null;
  executedAmount?: number;
  isHasValue?: boolean;
  isHasMaterial?: boolean;
};

export type ContractItem = {
  id: string;
  contractItemId: string;
  materialCode: string;
  materialName: string;
  materialPrice: number;
  contractQuantity: number;
  executedQuantity: number;
  totalItemAmount: number;
  remainingQuantity: number;
  maxExecutableQuantity: number;
};

// Danh sách vật tư cho một kỳ tiến độ (API /contractprogress/items/{contractId})
export type ContractProgressItemSource = {
  id: string;
  contractId: string;
  materialId: string;
  materialCode: string | null;
  materialName: string;
  price: number;
  quantity: number;
  amount: number;
  unit?: string;
  executedQuantity?: number;
};

// Payload tạo mới tiến độ với các vật tư (API /contractprogress/with-items)
export type CreateContractProgressWithItemsRequest = {
  contractId: string;
  paymentScheduleId?: string | null;
  periodStart: string;
  periodEnd: string;
  contractProgressItems: {
    contractItemId: string;
    executedQuantity: number;
  }[];
  contractPaymentId?: string | null;
  executedAmount?: number;
};

export type CreateContractProgressWithItemsResponse = {
  progressId: string;
  progressItemCount: number;
  success: boolean;
  message: string;
};

export type UpdateContractProgressWithItemsRequest = {
  contractId: string;
  id: string;
  paymentScheduleId?: string | null;
  periodStart: string;
  periodEnd: string;
  contractProgressItems: {
    id: string;
    contractItemId: string;
    executedQuantity: number;
  }[];
  contractPaymentId?: string | null;
  executedAmount?: number;
};

export type UpdateContractProgressWithItemsResponse = {
  success: boolean;
  message: string;
};

export type YearlySummary = {
  fromYear: number;
  toYear: number;
  total: number;
  yearlySummaries: YearlySummaryItem[];
};

export type YearlySummaryItem = {
  year: number;
  yearTotal: number;
  contractItems: ContractItem[];
};

export type WorkInProgress = {
  totalAmount: number;
  items: WorkInProgressItem[];
};

export type WorkInProgressItem = {
  materialCode: string;
  materialName: string;
  materialPrice: number;
  contractQuantity: number;
  executedQuantity: number;
  totalItemAmount: number;
};
