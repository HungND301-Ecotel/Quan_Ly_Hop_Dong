import { API } from '@/constants/api';
import { api } from '@/lib/api';
import {
  ContractProgressDetail,
  ContractProgressItemSource,
  CreateContractProgressWithItemsRequest,
  CreateContractProgressWithItemsResponse,
  UpdateContractProgressWithItemsRequest,
  UpdateContractProgressWithItemsResponse,
  WorkInProgress,
  YearlySummary,
} from './type';

function getContractProgressDetail(contractId: string) {
  return api.get<ContractProgressDetail, string>(
    API.CONTRACT_PROGRESS.DETAIL(contractId)
  );
}

function getYearlySummary(contractId: string) {
  return api.get<YearlySummary, string>(
    API.CONTRACT_PROGRESS.YEARLY_SUMMARY(contractId)
  );
}

function getWorkInProgress(contractId: string) {
  return api.get<WorkInProgress, string>(
    API.CONTRACT_PROGRESS.WORK_IN_PROGRESS(contractId)
  );
}

function getContractProgressItems(contractId: string) {
  return api.get<ContractProgressItemSource[], string>(
    API.CONTRACT_PROGRESS.ITEMS(contractId)
  );
}

function createContractProgressWithItems(
  body: CreateContractProgressWithItemsRequest
) {
  return api.post<
    CreateContractProgressWithItemsResponse,
    CreateContractProgressWithItemsRequest
  >(API.CONTRACT_PROGRESS.CREATE_WITH_ITEMS, body);
}

function updateContractProgressWithItems(
  body: UpdateContractProgressWithItemsRequest
) {
  return api.put<
    UpdateContractProgressWithItemsResponse,
    UpdateContractProgressWithItemsRequest
  >(API.CONTRACT_PROGRESS.CREATE_WITH_ITEMS, body);
}

function deleteContractProgress(id: string) {
  return api.delete<void, string>(API.CONTRACT_PROGRESS.DELETE(id));
}

export const contractProgressService = {
  getContractProgressDetail,
  getYearlySummary,
  getWorkInProgress,
  getContractProgressItems,
  createContractProgressWithItems,
  updateContractProgressWithItems,
  deleteContractProgress,
};
