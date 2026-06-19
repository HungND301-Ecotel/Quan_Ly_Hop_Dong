import { API } from '@/constants/api';
import { api } from '@/lib/api';
import { ContractAppendix } from './type';

async function getContractAppendixList() {
  return await api.get<ContractAppendix[], undefined>(
    API.CONTRACT_APPENDIX.LIST
  );
}

async function getContractAppendixDetail(id: string) {
  return await api.get<ContractAppendix, undefined>(
    API.CONTRACT_APPENDIX.DETAIL(id)
  );
}

async function createContractAppendix(data: Omit<ContractAppendix, 'id'>) {
  return await api.post<ContractAppendix, Omit<ContractAppendix, 'id'>>(
    API.CONTRACT_APPENDIX.CREATE,
    data
  );
}

async function updateContractAppendix(data: ContractAppendix) {
  return await api.put<ContractAppendix, ContractAppendix>(
    API.CONTRACT_APPENDIX.UPDATE,
    data
  );
}

async function deleteManyContractAppendixes(ids: string[]) {
  return await api.delete<unknown, string[]>(API.CONTRACT_APPENDIX.DELETE, ids);
}

export const contractAppendixService = {
  getContractAppendixList,
  getContractAppendixDetail,
  createContractAppendix,
  updateContractAppendix,
  deleteManyContractAppendixes,
};
export type { ContractAppendix };
