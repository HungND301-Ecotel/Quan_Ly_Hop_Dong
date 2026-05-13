import { API } from '@/constants/api';
import { api } from '@/lib/api';
import { ContractRegister } from './type';

const getContractRegisterList = async () => {
  return await api.get<ContractRegister[], undefined>(
    API.CONTRACT_REGISTER.LIST
  );
};

async function getContractRegister(id: string) {
  return await api.get<ContractRegister, string>(
    API.CONTRACT_REGISTER.DETAIL(id)
  );
}

async function createContractRegister(body: Omit<ContractRegister, 'id'>) {
  return await api.post<boolean, Omit<ContractRegister, 'id'>>(
    API.CONTRACT_REGISTER.CREATE,
    body
  );
}

async function updateContractRegister(body: ContractRegister) {
  return await api.put<boolean, ContractRegister>(
    API.CONTRACT_REGISTER.UPDATE,
    body
  );
}

async function deleteContractRegisterList(ids: string[]) {
  return await api.delete<boolean, string[]>(API.CONTRACT_REGISTER.DELETE, ids);
}

export const ContractRegisterService = {
  getContractRegisterList,
  getContractRegister,
  createContractRegister,
  updateContractRegister,
  deleteContractRegisterList,
};
