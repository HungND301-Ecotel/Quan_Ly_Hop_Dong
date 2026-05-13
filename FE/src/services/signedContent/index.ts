import { API } from '@/constants/api';
import { api } from '@/lib/api';
import {
  CreateSignedContentReq,
  SignedContent,
  UpdateSignedContentReq,
} from './type';

async function getSignedContentList() {
  return await api.get<SignedContent[], { search?: string }>(
    API.SIGNED_CONTENT.LIST,
  );
}

async function getSignedContentDetail(id: string) {
  return await api.get<SignedContent, undefined>(API.SIGNED_CONTENT.DETAIL(id));
}

async function createSignedContent(body: CreateSignedContentReq) {
  return await api.post<unknown, CreateSignedContentReq>(
    API.SIGNED_CONTENT.CREATE,
    body
  );
}

async function updateSignedContent(body: UpdateSignedContentReq) {
  return await api.put<unknown, UpdateSignedContentReq>(
    API.SIGNED_CONTENT.UPDATE,
    body
  );
}

async function deleteSignedContentList(ids: string[]) {
  return await api.delete(API.SIGNED_CONTENT.DELETE, ids);
}

async function getSignedContentByLevel3(level3CodeId: string) {
  return await api.get<SignedContent[], undefined>(
    API.SIGNED_CONTENT.BY_LEVEL3(level3CodeId)
  );
}

export const signedContentService = {
  getSignedContentList,
  getSignedContentDetail,
  createSignedContent,
  updateSignedContent,
  deleteSignedContentList,
  getSignedContentByLevel3
};