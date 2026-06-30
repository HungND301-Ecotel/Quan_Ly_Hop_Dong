import { API } from '@/constants/api';
import { api } from '@/lib/api';
import { User } from '@/types/user.type';

import { CreateSignatureReq, CreateUserReq, UpdateUserReq } from './type';

const getUserDetail = async (userId: string) => {
  return await api.get<User, undefined>(API.USER.DETAIL(userId));
};

const getUserList = async () => {
  return await api.get<User[], undefined>(API.USER.LIST);
};

const createSignature = async (userId: string, data: CreateSignatureReq) => {
  const formData = new FormData();
  formData.append('SignatureType', data.SignatureType.toString());
  if (data.SignatureFile) {
    formData.append('SignatureFile', data.SignatureFile);
  }
  formData.append('Pin', data.Pin);
  formData.append('SavePin', data.SavePin.toString());

  return await api.post<null, FormData>(
    API.USER.SIGNATURE.CREATE(userId),
    formData
  );
};

const createUser = async (data: CreateUserReq) => {
  return await api.post<boolean, CreateUserReq>(API.USER.CREATE, data);
};

const updateUser = async (data: UpdateUserReq) => {
  return await api.put<boolean, UpdateUserReq>(API.USER.UPDATE, data);
};

const deleteUsers = async (ids: string[]) => {
  return await api.delete<boolean, string[]>(API.USER.DELETE_MANY, ids);
};

const resetPassword = async (userId: string) => {
  return await api.post<boolean, undefined>(API.USER.RESET_PASSWORD(userId));
};

export const userService = {
  getUserDetail,
  getUserList,
  createSignature,
  createUser,
  updateUser,
  deleteUsers,
  resetPassword,
};
