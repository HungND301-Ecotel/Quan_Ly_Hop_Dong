import { API } from '@/constants/api';
import { api } from '@/lib/api';
import {
  ApproveContractReq,
  Contract,
  ContractAttachment,
  ContractSignHistory,
  ContractType,
  // CreateContractReq,
  RejectContractReq,
} from '@/services/contract/type';

async function createContract(body: unknown) {
  return await api.post<ContractType[], unknown>(API.CONTRACT.CREATE, body);
}

async function uploadContract(body: {
  contractFile: File;
  contractNumber: string;
}) {
  const contractUploadReq = new FormData();

  contractUploadReq.append('ContractFile', body.contractFile);

  contractUploadReq.append('ContractNumber', body.contractNumber);

  return await api.post<string, FormData>(
    API.CONTRACT.UPLOAD_CONTRACT,
    contractUploadReq
  );
}

async function uploadAttachments(body: {
  attachmentFiles: File[];
  contractNumber: string;
}) {
  const attachmentUploadReq = new FormData();

  body.attachmentFiles.forEach((file) => {
    attachmentUploadReq.append('AttachmentFiles', file);
  });

  attachmentUploadReq.append('ContractNumber', body.contractNumber);

  return await api.post<ContractAttachment[], FormData>(
    API.CONTRACT.UPLOAD_ATTACHMENTS,
    attachmentUploadReq
  );
}

async function getContractPendingList() {
  return await api.get<Contract[], undefined>(
    API.CONTRACT.PENDING_APPROVAL.LIST
  );
}

export type GetContractListReq = {
  search?: string;
  contractTypeId?: string;
  departmentId?: string;
  partnerId?: string;
  status?: number;
  startDate?: string;
  endDate?: string;
  formats?: number[];
  isArchiveContract?: boolean;
  isDebtTrackingEnabled?: boolean;
};

export type GetContractByFormatReq = {
  contractFormat?: number;
};

async function getContractList(req?: GetContractListReq) {
  return await api.get<Contract[], GetContractListReq>(API.CONTRACT.LIST, req);
}

async function deleteContract(contractIds: string[]) {
  return await api.delete(API.CONTRACT.DELETES, contractIds);
}

async function getContractDetail(contractId: string) {
  return await api.get<Contract, undefined>(API.CONTRACT.DETAIL(contractId));
}

async function getContractHistory(contractId: string) {
  return await api.get<ContractSignHistory[], undefined>(
    API.CONTRACT.SIGN_HISTORY(contractId)
  );
}

async function getContractHistoryList() {
  return await api.get<Contract[], undefined>(API.CONTRACT.HISTORY.LIST);
}

async function rejectContract(req: RejectContractReq) {
  return await api.post<unknown, RejectContractReq>(
    API.CONTRACT.APPROVE(req.contractId),
    req
  );
}

function approveContract(req: ApproveContractReq) {
  return api.post<unknown, ApproveContractReq>(
    API.CONTRACT.APPROVE(req.contractId),
    req
  );
}

async function updateContract(contractId: string, req: unknown) {
  return await api.put<unknown, unknown>(API.CONTRACT.UPDATE(contractId), req);
}

async function getContractSoonExpired(req?: GetContractByFormatReq) {
  return await api.get<Contract[], GetContractByFormatReq>(
    API.CONTRACT.SOON_EXPIRED,
    req
  );
}

async function getContractPaymentDueSoon(req?: GetContractByFormatReq) {
  return await api.get<Contract[], GetContractByFormatReq>(
    API.CONTRACT.PAYMENT_DUE_SOON,
    req
  );
}

export type ActivateContractReq = {
  contractId: string;
  status: number;
  subStatus: number;
  contractFilePath: string;
};

async function activateContract(body: ActivateContractReq) {
  return await api.post<unknown, ActivateContractReq>(
    API.CONTRACT.ACTIVATE,
    body
  );
}

async function cancelContract(contractId: string, reason: string) {
  return await api.post<unknown, { reason: string }>(
    API.CONTRACT.CANCEL(contractId),
    { reason }
  );
}

async function completeContract(body: {
  contractId: string;
  contractFile: File;
  contractNumber: string;
  status: number;
  subStatus: number;
}) {
  const filePath = await uploadContract({
    contractFile: body.contractFile,
    contractNumber: body.contractNumber,
  });

  if (!filePath) throw new Error('Upload file thất bại');

  return await activateContract({
    contractId: body.contractId,
    status: body.status,
    subStatus: body.subStatus,
    contractFilePath: filePath,
  });
}

async function submitForApproval(contractId: string) {
  return await api.post<string, undefined>(
    API.CONTRACT.SUBMIT_FOR_APPROVAL(contractId),
    undefined
  );
}

async function pauseContract(contractId: string, reason: string) {
  return await api.post<unknown, { reason: string }>(
    API.CONTRACT.PAUSE(contractId),
    { reason }
  );
}

async function resumeContract(contractId: string, reason: string) {
  return await api.post<unknown, { reason: string }>(
    API.CONTRACT.RESUME(contractId),
    { reason }
  );
}

async function archiveContract(contractId: string) {
  return await api.post<unknown, undefined>(
    API.CONTRACT.ARCHIVE(contractId),
    undefined
  );
}

async function getMyVisibleContractList(req?: GetContractListReq) {
  return await api.get<Contract[], GetContractListReq>(
    API.CONTRACT.MY_VISIBLE,
    req
  );
}

export const contractService = {
  createContract,
  updateContract,
  uploadContract,
  uploadAttachments,
  getContractPendingList,
  getContractHistoryList,
  getContractDetail,
  getContractHistory,
  getContractList,
  rejectContract,
  approveContract,
  deleteContract,
  getContractSoonExpired,
  getContractPaymentDueSoon,
  activateContract,
  cancelContract,
  completeContract,
  submitForApproval,
  pauseContract,
  resumeContract,
  archiveContract,
  getMyVisibleContractList,
};
