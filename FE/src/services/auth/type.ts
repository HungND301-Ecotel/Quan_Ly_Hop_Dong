import { Tokens } from '@/types/auth.type';

export type SignInReq = {
  username: string;
  password: string;
};

export type RefreshReq = Pick<Tokens, 'token' | 'refreshToken'>;
