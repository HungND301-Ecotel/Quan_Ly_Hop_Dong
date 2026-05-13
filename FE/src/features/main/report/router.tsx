import { Navigate, Outlet, RouteObject } from 'react-router-dom';
import Reports from './Reports';

export const reportRouter: RouteObject = {
  path: '/report',
  element: <Outlet />,
  children: [
    {
      index: true,
      element: <Navigate to='report' replace />,
    },
    {
      path: 'report',
      element: <Reports />,
    },
  ],
};
