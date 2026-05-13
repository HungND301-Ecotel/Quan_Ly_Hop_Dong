import { AuthProvider } from '@/features/provider';
import { Outlet } from 'react-router-dom';

export function RootLayout() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}
