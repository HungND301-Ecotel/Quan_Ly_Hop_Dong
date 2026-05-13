import { API } from '@/constants/api';
import { api } from '@/lib/api';
import {
  ContractPaymentBatchRequest,
  ContractPaymentBatchResponse,
  ContractPaymentDetail,
  MaterialUnitPriceReportQuery,
  MaterialUnitPriceReportYear,
  PaymentFileUploadResponse,
  PaymentSchedule,
  SyncResult,
  SyncPayload,
  GetContractReportsReq,
  ContractReportResponse,
} from './type';

function getContractPaymentDetail(contractId: string) {
  return api.get<ContractPaymentDetail, string>(
    API.CONTRACT_PAYMENT.DETAIL(contractId)
  );
}

function batchUpdatePayments(data: ContractPaymentBatchRequest) {
  return api.put<ContractPaymentBatchResponse, ContractPaymentBatchRequest>(
    API.CONTRACT_PAYMENT.UPDATE,
    data
  );
}

function uploadPaymentFile(
  file: File,
  contractId: string,
  fileType: 'AcceptanceReport' | 'Invoice' | 'Tax' | 'Liquidation'
) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('contractId', contractId);
  formData.append('fileType', fileType);

  return api.post<PaymentFileUploadResponse, FormData>(
    API.CONTRACT_PAYMENT.UPLOAD,
    formData
  );
}

function updateLiquidationFile(contractId: string, liquidationFilePath: string) {
  return api.put<void, { contractId: string; liquidationFilePath: string }>(
    API.CONTRACT_PAYMENT.UPDATE_LIQUIDATION_FILE(contractId),
    { contractId, liquidationFilePath }
  );
}

function getPaymentSchedules(contractId: string) {
  return api.get<PaymentSchedule[], string>(
    API.CONTRACT_PAYMENT.PAYMENT_SCHEDULES(contractId)
  );
}

function getMaterialUnitPriceReports(params?: MaterialUnitPriceReportQuery) {
  return api.post<MaterialUnitPriceReportYear[], MaterialUnitPriceReportQuery>(
    API.CONTRACT_PAYMENT.MATERIAL_UNIT_PRICE_REPORTS,
    params
  );
}

function syncInvoice(data: SyncPayload) {
  return api.post<SyncResult, SyncPayload>(
    API.CONTRACT_PAYMENT.SYNC_INVOICE,
    data
  );
}

function syncTax(data: SyncPayload) {
  return api.post<SyncResult, SyncPayload>(
    API.CONTRACT_PAYMENT.SYNC_TAX,
    data
  );
}

function getContractReports(req?: GetContractReportsReq) {
  return api.get<ContractReportResponse[], GetContractReportsReq>(
    API.CONTRACT_PAYMENT.REPORTS,
    req
  );
}

export const contractPaymentService = {
  getContractPaymentDetail,
  batchUpdatePayments,
  getPaymentSchedules,
  getMaterialUnitPriceReports,
  uploadPaymentFile,
  updateLiquidationFile,
  syncInvoice,
  syncTax,
  getContractReports,

};
