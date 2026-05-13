import { API } from '@/constants/api';
import { api } from '@/lib/api';
import { CreateMaterialReq, Material, UpdateMaterialReq } from './type';

async function getMaterialList() {
  return api.get<Material[], undefined>('/material');
}

async function getOtherMaterialList() {
  return api.get<Material[], undefined>('/material?IsOtherMaterial=true');
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
async function syncMaterial() {
  return await api.post<string, undefined>('/material/sync', undefined);
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
