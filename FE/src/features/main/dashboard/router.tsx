import { Navigate, Outlet, RouteObject } from 'react-router-dom';
import Dashboard from './dashboard';

export const dashboardRouter: RouteObject = {
  path: '/',
  element: <Outlet />,
  children: [
    {
      index: true,
      element: <Navigate to='dashboard' replace />,
    },
    {
      path: 'dashboard',
      element: <Dashboard />,
      handle: {
        title: 'Dashboard',
        description: 'Tổng quan hệ thống quản lý hợp đồng',
      },
    },
  ],
};
