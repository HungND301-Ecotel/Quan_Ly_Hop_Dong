import { API } from '@/constants/api';
import { api } from '@/lib/api';
import {
  CreateLevel2CodeReq,
  Level2Code,
  Level2CodeLookup,
  UpdateLevel2CodeReq,
} from './type';

async function getLevel2CodeList() {
  return await api.get<Level2Code[], { search?: string }>(
    API.LEVEL2_CODE.LIST,
  );
}

async function getLevel2CodeDetail(id: string) {
  return await api.get<Level2Code, undefined>(API.LEVEL2_CODE.DETAIL(id));
}

async function createLevel2Code(body: CreateLevel2CodeReq) {
  return await api.post<unknown, CreateLevel2CodeReq>(
    API.LEVEL2_CODE.CREATE,
    body
  );
}

async function updateLevel2Code(body: UpdateLevel2CodeReq) {
  return await api.put<unknown, UpdateLevel2CodeReq>(
    API.LEVEL2_CODE.UPDATE,
    body
  );
}

async function deleteLevel2CodeList(ids: string[]) {
  return await api.delete(API.LEVEL2_CODE.DELETE, ids);
}

async function getLevel2CodeByLevel1(level1CodeId: string) {
  return await api.get<Level2CodeLookup[], undefined>(
    API.LEVEL2_CODE.BY_LEVEL1(level1CodeId)
  );
}

export const level2CodeService = {
  getLevel2CodeList,
  getLevel2CodeDetail,
  createLevel2Code,
  updateLevel2Code,
  deleteLevel2CodeList,
  getLevel2CodeByLevel1
};
