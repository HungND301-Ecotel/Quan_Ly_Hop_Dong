import { API } from '@/constants/api';
import { api } from '@/lib/api';
import { ProcurementMethod } from './type';

const getProcurementMethodList = async () => {
  return await api.get<ProcurementMethod[], undefined>(
    API.PROCUREMENT_METHOD.LIST
  );
};

async function getProcurementMethod(id: string) {
  return await api.get<ProcurementMethod, string>(
    API.PROCUREMENT_METHOD.DETAIL(id)
  );
}

async function createProcurementMethod(body: Omit<ProcurementMethod, 'id'>) {
  return await api.post<boolean, Omit<ProcurementMethod, 'id'>>(
    API.PROCUREMENT_METHOD.CREATE,
    body
  );
}

async function updateProcurementMethod(body: ProcurementMethod) {
  return await api.put<boolean, ProcurementMethod>(
    API.PROCUREMENT_METHOD.UPDATE,
    body
  );
}

async function deleteProcurementMethodList(ids: string[]) {
  return await api.delete<boolean, string[]>(
    API.PROCUREMENT_METHOD.DELETE,
    ids
  );
}

export const procurementMethodService = {
  getProcurementMethodList,
  getProcurementMethod,
  createProcurementMethod,
  updateProcurementMethod,
  deleteProcurementMethodList,
};
