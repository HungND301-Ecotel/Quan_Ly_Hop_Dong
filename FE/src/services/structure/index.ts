import { API } from '@/constants/api';
import { api } from '@/lib/api';
import {
  CreateContractStructureCatalogReq,
  ContractStructureCatalog,
  UpdateContractStructureCatalogReq,
} from './type';

async function getContractStructureCatalogList(params?: { isActive?: boolean; search?: string }) {
  return await api.get<ContractStructureCatalog[], { isActive?: boolean; search?: string }>(
    API.CONTRACT_STRUCTURE_CATALOG.LIST,
    params
  );
}

async function getContractStructureCatalogDetail(id: string) {
  return await api.get<ContractStructureCatalog, undefined>(
    API.CONTRACT_STRUCTURE_CATALOG.DETAIL(id)
  );
}

async function createContractStructureCatalog(body: CreateContractStructureCatalogReq) {
  return await api.post<unknown, CreateContractStructureCatalogReq>(
    API.CONTRACT_STRUCTURE_CATALOG.CREATE,
    body
  );
}

async function updateContractStructureCatalog(body: UpdateContractStructureCatalogReq) {
  return await api.put<unknown, UpdateContractStructureCatalogReq>(
    API.CONTRACT_STRUCTURE_CATALOG.UPDATE,
    body
  );
}

async function deleteContractStructureCatalog(id: string) {
  return await api.delete(
    API.CONTRACT_STRUCTURE_CATALOG.DELETE(id)
  );
}

export const contractStructureCatalogService = {
  getContractStructureCatalogList,
  getContractStructureCatalogDetail,
  createContractStructureCatalog,
  updateContractStructureCatalog,
  deleteContractStructureCatalog,
};