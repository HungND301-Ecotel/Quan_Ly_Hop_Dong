import { useAuthContext } from '@/features/context';
import { MainHeader } from '@/features/main/layout/components/header';
import { Navigate, Outlet } from 'react-router-dom';
import { MainContent } from './components/content';
import { MainLayoutProvider } from './provider';

export function MainLayout() {
  const { user, loading } = useAuthContext();

  if (!loading && !user) return <Navigate to='/auth/sign-in' />;

  return (
    <MainLayoutProvider>
      <div className='bg-muted w-full h-full min-h-screen flex flex-col'>
        <MainHeader />

        <div className='flex-1 p-6 space-y-6'>
          <MainContent />
          <Outlet />
        </div>
      </div>
    </MainLayoutProvider>
  );
}
