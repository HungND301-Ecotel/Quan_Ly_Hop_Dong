import { Navigate, Outlet, RouteObject } from 'react-router-dom';

export const statisticRouter: RouteObject = {
  path: '/',
  element: <Outlet />,
  children: [
    {
      index: true,
      element: <Navigate to='dashboard' replace />,
    },
    {
      path: 'report',
      element: <Navigate to='report' replace />,
    },
  ],
};
