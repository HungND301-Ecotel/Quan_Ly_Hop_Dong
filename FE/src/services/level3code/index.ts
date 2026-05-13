import { API } from '@/constants/api';
import { api } from '@/lib/api';
import {
  CreateLevel3CodeReq,
  Level3Code,
  UpdateLevel3CodeReq,
} from './type';

async function getLevel3CodeList() {
  return await api.get<Level3Code[], { search?: string }>(
    API.LEVEL3_CODE.LIST,
  );
}

async function getLevel3CodeDetail(id: string) {
  return await api.get<Level3Code, undefined>(API.LEVEL3_CODE.DETAIL(id));
}

async function createLevel3Code(body: CreateLevel3CodeReq) {
  return await api.post<unknown, CreateLevel3CodeReq>(
    API.LEVEL3_CODE.CREATE,
    body
  );
}

async function updateLevel3Code(body: UpdateLevel3CodeReq) {
  return await api.put<unknown, UpdateLevel3CodeReq>(
    API.LEVEL3_CODE.UPDATE,
    body
  );
}

async function deleteLevel3CodeList(ids: string[]) {
  return await api.delete(API.LEVEL3_CODE.DELETE, ids);
}

async function getLevel3CodeByLevel1(level1CodeId: string) {
  return await api.get<Level3Code[], undefined>(
    API.LEVEL3_CODE.BY_LEVEL1(level1CodeId)
  );
}

export const level3CodeService = {
  getLevel3CodeList,
  getLevel3CodeDetail,
  createLevel3Code,
  updateLevel3Code,
  deleteLevel3CodeList,
  getLevel3CodeByLevel1
};