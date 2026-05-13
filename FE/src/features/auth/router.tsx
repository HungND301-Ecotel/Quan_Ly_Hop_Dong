import { AuthLayout } from '@/features/auth/layout';
import { SignInPage } from '@/features/auth/sign-in/page';
import { Navigate, RouteObject } from 'react-router-dom';

export const authRouter: RouteObject = {
  path: '/auth',
  element: <AuthLayout />,
  children: [
    {
      index: true,
      element: <Navigate to='/auth/login' replace />,
    },
    {
      path: 'sign-in',
      element: <SignInPage />,
    },
  ],
};
