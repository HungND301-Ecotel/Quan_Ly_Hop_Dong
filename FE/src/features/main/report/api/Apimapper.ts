/**
 * Convert API response to mockData format
 * Handle null/undefined safely
 */

export type ApiContractResponse = {
  codeLevel1: string;
  codeLevel2: string;
  codeLevel3: string;
  contractType: string;
  selectionMethod: string;
  contractFormat: string;
  contractContentName: string;
  trackingNumber: string;
  contractCode: string;
  appendixNumber?: string;
  partnerName: string;
  address?: string;
  taxCode?: string;
  representativeName?: string;
  signingDate?: string;
  expiryDate?: string;
  paymentTerm: string;
  quantity?: number;
  unitPrice?: number;
  amount?: number;
  contractValue: number;
  guaranteeValue?: string;
  guaranteeTermAndBank?: string;
  execution: {
    month1: { quantity: number; amount: number };
    month2: { quantity: number; amount: number };
    month3: { quantity: number; amount: number };
    month4: { quantity: number; amount: number };
    month5: { quantity: number; amount: number };
    month6: { quantity: number; amount: number };
    month7: { quantity: number; amount: number };
    month8: { quantity: number; amount: number };
    month9: { quantity: number; amount: number };
    month10: { quantity: number; amount: number };
    month11: { quantity: number; amount: number };
    month12: { quantity: number; amount: number };
    yearlyAccumulation: { quantity: number; amount: number };
    incompletedWork: { quantity: number; amount: number };
    estimatedExecution: { quantity: number; amount: number };
  };
  liquidationStatus: string;
  createdByUser?: string;
  manager?: string;
  receivingUnit?: string;
  notes?: string;
};

export type ContractRecord = {
  id: string;
  stt: number;
  categoryCode1: string;
  categoryCode2: string;
  categoryCode3: string;
  biddingForm: string;
  contractForm: string;
  name: string;
  trackingBook: string;
  contractNumber: string;
  appendixNumber?: string;
  partner: string;
  partnerAddress?: string;
  partnerTaxCode?: string;
  partnerRepresentative?: string;
  signedDate?: string;
  expiryDate?: string;
  paymentCycle: string;
  previousYearAmount: number;
  quantity?: number;
  unitPrice?: number;
  totalAmount: number;
  guarantee?: { valuePercent?: string; valueAmount?: number; deadline?: string; bank?: string };
  monthlyExecutions: Array<{ month: number; quantity: number; amount: number }>;
  yearCumulativeQuantity?: number;
  yearCumulativeAmount: number;
  pendingQuantity?: number;
  pendingAmount?: number;
  estimatedQuantity?: number;
  estimatedAmount?: number;
  liquidationStatus: string;
  draftedBy?: string;
  managedBy?: string;
  receivedBy?: string;
  notes?: string;
};

export function mapApiResponseToContract(apiData: ApiContractResponse, index: number): ContractRecord {
  const monthlyExecutions: Array<{ month: number; quantity: number; amount: number }> = [];
  
  for (let month = 1; month <= 12; month++) {
    const key = `month${month}` as keyof typeof apiData.execution;
    const monthData = apiData.execution[key];
    monthlyExecutions.push({
      month,
      quantity: monthData.quantity ?? 0,
      amount: monthData.amount ?? 0,
    });
  }

  return {
    id: `${apiData.contractCode}-${index}`,
    stt: index + 1,
    categoryCode1: apiData.codeLevel1,
    categoryCode2: apiData.codeLevel2,
    categoryCode3: apiData.codeLevel3,
    biddingForm: apiData.selectionMethod,
    contractForm: apiData.contractFormat,
    name: apiData.contractContentName ?? '',
    trackingBook: apiData.trackingNumber,
    contractNumber: apiData.contractCode,
    appendixNumber: apiData.appendixNumber,
    partner: apiData.partnerName,
    partnerAddress: apiData.address,
    partnerTaxCode: apiData.taxCode,
    partnerRepresentative: apiData.representativeName,
    signedDate: apiData.signingDate,
    expiryDate: apiData.expiryDate,
    paymentCycle: apiData.paymentTerm,
    previousYearAmount: 0,
    quantity: apiData.quantity,
    unitPrice: apiData.unitPrice,
    totalAmount:
      apiData.contractValue && apiData.contractValue !== 0
        ? apiData.contractValue
        : apiData.amount ?? 0,
    guarantee: parseGuarantee(apiData.guaranteeValue, apiData.guaranteeTermAndBank),
    monthlyExecutions,
    yearCumulativeQuantity: apiData.execution.yearlyAccumulation.quantity,
    yearCumulativeAmount: apiData.execution.yearlyAccumulation.amount,
    pendingQuantity: apiData.execution.incompletedWork.quantity,
    pendingAmount: apiData.execution.incompletedWork.amount,
    estimatedQuantity: apiData.execution.estimatedExecution.quantity,
    estimatedAmount: apiData.execution.estimatedExecution.amount,
    liquidationStatus: mapLiquidationStatus(apiData.liquidationStatus),
    draftedBy: apiData.createdByUser,
    managedBy: apiData.manager,
    receivedBy: apiData.receivingUnit,
    notes: apiData.notes,
  };
}

function mapLiquidationStatus(status: string): 'R' | 'TTL' | 'C' {
  if (!status) return 'C';
  const upper = status.toUpperCase();
  if (upper.includes('THANH') || upper.includes('LIQUIDAT')) return 'TTL';
  if (upper.includes('CHO')) return 'C';
  return 'R';
}

function parseGuarantee(
  valueStr?: string,
  termAndBankStr?: string
): ContractRecord['guarantee'] {
  if (!valueStr) return undefined;

  // Try to parse "10% - 1000000" format
  const match = valueStr.match(/(\d+(?:\.\d+)?)\%?\s*-?\s*([\d,]+)?/);
  if (!match) return undefined;

  const valuePercent = match[1];
  const valueAmount = match[2] ? parseInt(match[2].replace(/,/g, ''), 10) : undefined;

  const [deadline, bank] = termAndBankStr?.split('/').map((s) => s.trim()) ?? [];

  return {
    valuePercent,
    valueAmount,
    deadline,
    bank,
  };
}