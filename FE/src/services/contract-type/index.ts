import { API } from '@/constants/api';
import { api } from '@/lib/api';
import { ContractType } from './type';

async function getContractTypeList() {
  return await api.get<ContractType[], undefined>(API.CONTRACT_TYPE.LIST);
}

async function getContractTypeDetail(id: string) {
  return await api.get<ContractType, undefined>(API.CONTRACT_TYPE.DETAIL(id));
}

async function createContractType(data: Omit<ContractType, 'id'>) {
  return await api.post<ContractType, Omit<ContractType, 'id'>>(
    API.CONTRACT_TYPE.CREATE,
    data
  );
}

async function updateContractType(data: ContractType) {
  return await api.put<ContractType, ContractType>(
    API.CONTRACT_TYPE.UPDATE,
    data
  );
}

async function deleteContractType(id: string) {
  return await api.delete<unknown, string[]>(API.CONTRACT_TYPE.DELETE, [id]);
}

async function deleteManyContractTypes(ids: string[]) {
  return await api.delete<unknown, string[]>(API.CONTRACT_TYPE.DELETE, ids);
}

export const contractTypeService = {
  getContractTypeList,
  getContractTypeDetail,
  createContractType,
  updateContractType,
  deleteContractType,
  deleteManyContractTypes,
};
