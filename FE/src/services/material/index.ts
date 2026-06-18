import { API } from '@/constants/api';
import { api } from '@/lib/api';
import { CreateMaterialReq, Material, UpdateMaterialReq } from './type';

async function getMaterialList(): Promise<Material[]>;
async function getMaterialList(params: { pageNumber: number; pageSize: number; keyword?: string }): Promise<{ data: Material[]; totalCount: number; totalPages: number }>;
async function getMaterialList(params?: any): Promise<any> {
  return api.get<any, any>('/material', params);
}

async function getOtherMaterialList(): Promise<Material[]>;
async function getOtherMaterialList(params: { pageNumber: number; pageSize: number; keyword?: string }): Promise<{ data: Material[]; totalCount: number; totalPages: number }>;
async function getOtherMaterialList(params?: any): Promise<any> {
  return api.get<any, any>('/material', { ...params, IsOtherMaterial: true });
}

async function getMaterialDetail(id: string) {
  return api.get<Material, undefined>(API.MATERIALS.DETAIL(id));
}

async function createMaterial(body: CreateMaterialReq) {
  return await api.post<boolean, CreateMaterialReq>(
    API.MATERIALS.CREATE,
    body
  );
}

async function updateMaterial(body: UpdateMaterialReq) {
  return await api.put<boolean, UpdateMaterialReq>(API.MATERIALS.UPDATE, body);
}

async function deleteMaterialList(ids: string[]) {
  return await api.delete<boolean, string[]>(API.MATERIALS.DELETE, ids);
}
async function syncMaterial(body: { sourceConnectionId: string }) {
  return await api.post<string, { sourceConnectionId: string }>('/material/sync', body);
}

export const materialService = {
  getMaterialList,
  getMaterialDetail,
  getOtherMaterialList,
  createMaterial,
  updateMaterial,
  deleteMaterialList,
  syncMaterial,
};
