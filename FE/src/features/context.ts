import { SignInReq } from '@/services/auth/type';
import { User } from '@/types/user.type';
import { createContext, useContext } from 'react';

export type AuthContextValue = {
  loading: boolean;
  user?: User;
  signIn: (credentials: SignInReq) => Promise<void>;
  signOut: () => void;
  refreshUser: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }

  return context;
};