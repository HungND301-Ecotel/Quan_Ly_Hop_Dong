import { Navigate, Outlet, RouteObject } from 'react-router-dom';
import NotificationList from './NotificationList';

export const notificationRouter: RouteObject = {
  path: '/',
  element: <Outlet />,
  children: [
    {
      index: true,
      element: <Navigate to='notification' replace />,
    },
    {
      path: 'notification',
      element: <NotificationList />,
    },
  ],
};
