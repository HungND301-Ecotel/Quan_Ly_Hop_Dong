import { AuthContext } from '@/features/context';
import { authService } from '@/services/auth';
import { SignInReq } from '@/services/auth/type';
import { userService } from '@/services/user';
import { Payload, Tokens } from '@/types/auth.type';
import { User } from '@/types/user.type';
import { jwtDecode } from 'jwt-decode';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async (token: string) => {
    try {
      const payload = jwtDecode<Payload>(token);
      const res = await userService.getUserDetail(payload.nameidentifier);
      setUser(res);
    } catch {
      authStore.clear();
      setUser(undefined);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const tokens = authStore.get();
    if (tokens) {
      fetchUser(tokens.token);
    } else {
      setLoading(false);
    }
  }, [fetchUser]);

  const signIn = useCallback(
    async (credentials: SignInReq) => {
      try {
        const res = await authService.signIn(credentials);
        if (res) {
          authStore.set(res);
          await fetchUser(res.token);
          toast.success('Đăng nhập thành công');
          navigate('/');
        }
      } catch (error) {
        console.error('Login failed', error);
        toast.error('Tên đăng nhập hoặc mật khẩu sai');
      }
    },
    [fetchUser, navigate]
  );

  const signOut = useCallback(() => {
    authStore.clear();
    setUser(undefined);
    navigate('/auth/sign-in');
  }, [navigate]);

  const refreshUser = useCallback(async () => {
    const tokens = authStore.get();
    if (!tokens) return;
    await fetchUser(tokens.token);
  }, [fetchUser]);

  const value = useMemo(
    () => ({
      loading,
      user,
      signIn,
      signOut,
      refreshUser,
      isAuthenticated: !!user,
    }),
    [loading, user, signIn, signOut, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

const authStore = {
  set: (tokens: Tokens) => {
    localStorage.setItem('token', tokens.token);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    localStorage.setItem(
      'refreshTokenExpiryTime',
      tokens.refreshTokenExpiryTime
    );
  },
  get: () => {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    const expiry = localStorage.getItem('refreshTokenExpiryTime');
    if (!token || !refreshToken || !expiry) return null;
    return { token, refreshToken, refreshTokenExpiryTime: expiry };
  },
  clear: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('refreshTokenExpiryTime');
  },
};
