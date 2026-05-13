import { NotFoundPage } from '@/features/not-found/page';
import { RouteObject } from 'react-router-dom';

export const notFoundRouter: RouteObject = {
  path: '*',
  element: <NotFoundPage />,
};
