import { RouteObject } from 'react-router-dom';
import { ProfilePage } from './page';

export const profileRouter: RouteObject = {
  path: '/profile',
  element: <ProfilePage />,
  handle: {
    title: 'Hồ sơ cá nhân',
    description: 'Thông tin tài khoản và chữ ký của bạn',
  },
};
