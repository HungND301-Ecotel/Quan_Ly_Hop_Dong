import { API } from '@/constants/api';
import { api } from '@/lib/api';
import { RefreshReq, SignInReq } from '@/services/auth/type';
import { Tokens } from '@/types/auth.type';

const signIn = async (req: SignInReq) => {
  return await api.post<Tokens, SignInReq>(API.AUTH.SIGN_IN, req);
};

const refresh = async (req: RefreshReq) => {
  return await api.post<Tokens, RefreshReq>(API.AUTH.REFRESH, req);
};

export const authService = {
  signIn,
  refresh,
};
