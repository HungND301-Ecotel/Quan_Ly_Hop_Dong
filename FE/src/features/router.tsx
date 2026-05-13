import { authRouter } from '@/features/auth/router';
import { RootLayout } from '@/features/layout';
import { contractAllRouter, mainRouter } from '@/features/main/router';
import { notFoundRouter } from '@/features/not-found/router';
import { createBrowserRouter, type RouteObject } from 'react-router-dom';

const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    children: [authRouter, mainRouter, notFoundRouter, contractAllRouter],
  },
];

export const router = createBrowserRouter(routes);
