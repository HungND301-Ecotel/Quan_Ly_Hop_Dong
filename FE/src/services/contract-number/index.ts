import { API } from '@/constants/api';
import { api } from '@/lib/api';
import { ContractNumber } from './type';

async function getContractNumberList() {
  return await api.get<ContractNumber[], undefined>(API.CONTRACT_NUMBER.LIST);
}

async function getContractNumberDetail(id: string) {
  return await api.get<ContractNumber, undefined>(
    API.CONTRACT_NUMBER.DETAIL(id)
  );
}

async function createContractNumber(data: Omit<ContractNumber, 'id'>) {
  return await api.post<ContractNumber, Omit<ContractNumber, 'id'>>(
    API.CONTRACT_NUMBER.CREATE,
    data
  );
}

async function updateContractNumber(data: ContractNumber) {
  return await api.put<ContractNumber, ContractNumber>(
    API.CONTRACT_NUMBER.UPDATE,
    data
  );
}

async function deleteManyContractNumbers(ids: string[]) {
  return await api.delete<unknown, string[]>(API.CONTRACT_NUMBER.DELETE, ids);
}

export const contractNumberService = {
  getContractNumberList,
  getContractNumberDetail,
  createContractNumber,
  updateContractNumber,
  deleteManyContractNumbers,
};
export type { ContractNumber };
