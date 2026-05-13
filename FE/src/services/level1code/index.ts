import { API } from '@/constants/api';
import { api } from '@/lib/api';
import {
  CreateLevel1CodeReq,
  Level1Code,
  UpdateLevel1CodeReq,
} from './type';

async function getLevel1CodeList() {
  return await api.get<Level1Code[], { search?: string }>(
    API.LEVEL1_CODE.LIST,
  );
}

async function getLevel1CodeDetail(id: string) {
  return await api.get<Level1Code, undefined>(API.LEVEL1_CODE.DETAIL(id));
}

async function createLevel1Code(body: CreateLevel1CodeReq) {
  return await api.post<unknown, CreateLevel1CodeReq>(
    API.LEVEL1_CODE.CREATE,
    body
  );
}

async function updateLevel1Code(body: UpdateLevel1CodeReq) {
  return await api.put<unknown, UpdateLevel1CodeReq>(
    API.LEVEL1_CODE.UPDATE,
    body
  );
}

async function deleteLevel1CodeList(ids: string[]) {
  return await api.delete(API.LEVEL1_CODE.DELETE, ids);
}

export const level1CodeService = {
  getLevel1CodeList,
  getLevel1CodeDetail,
  createLevel1Code,
  updateLevel1Code,
  deleteLevel1CodeList,
};