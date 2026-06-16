import { API } from '@/constants/api';
import { api } from '@/lib/api';
import { ContractField } from './type';

async function getContractFieldList() {
  return await api.get<ContractField[], undefined>(API.CONTRACT_FIELD.LIST);
}

async function getContractFieldDetail(id: string) {
  return await api.get<ContractField, undefined>(API.CONTRACT_FIELD.DETAIL(id));
}

async function createContractField(data: Omit<ContractField, 'id'>) {
  return await api.post<ContractField, Omit<ContractField, 'id'>>(
    API.CONTRACT_FIELD.CREATE,
    data
  );
}

async function updateContractField(data: ContractField) {
  return await api.put<ContractField, ContractField>(
    API.CONTRACT_FIELD.UPDATE,
    data
  );
}

async function deleteManyContractFields(ids: string[]) {
  return await api.delete<unknown, string[]>(API.CONTRACT_FIELD.DELETE, ids);
}

export const contractFieldService = {
  getContractFieldList,
  getContractFieldDetail,
  createContractField,
  updateContractField,
  deleteManyContractFields,
};
