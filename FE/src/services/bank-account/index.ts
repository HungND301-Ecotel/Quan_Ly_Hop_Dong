import { API } from '@/constants/api';
import { api } from '@/lib/api';
import { BankAccount } from './type';

const getBankAccountList = async () => {
  return await api.get<BankAccount[], undefined>(API.BANK_ACCOUNT.LIST);
};

async function getBankAccount(id: string) {
  return await api.get<BankAccount, string>(API.BANK_ACCOUNT.DETAIL(id));
}

async function createBankAccount(body: Omit<BankAccount, 'id'>) {
  return await api.post<boolean, Omit<BankAccount, 'id'>>(
    API.BANK_ACCOUNT.CREATE,
    body
  );
}

async function updateBankAccount(body: BankAccount) {
  return await api.put<boolean, BankAccount>(API.BANK_ACCOUNT.UPDATE, body);
}

async function deleteBankAccountList(ids: string[]) {
  return await api.delete<boolean, string[]>(API.BANK_ACCOUNT.DELETE, ids);
}

export const BankAccountService = {
  getBankAccountList,
  getBankAccount,
  createBankAccount,
  updateBankAccount,
  deleteBankAccountList,
};