import { contractRouter } from '@/features/main/contract/router';
import { MainLayout } from '@/features/main/layout';
import { settingRouter } from '@/features/main/setting/router';
import { statisticRouter } from '@/features/main/statistic/router';
import { notFoundRouter } from '@/features/not-found/router';
import { RouteObject } from 'react-router-dom';
import { dashboardRouter } from './dashboard/router';
import { financeRouter } from './finance/router';
import { notificationRouter } from './notification/router';
import { profileRouter } from './profile/router';
import { reportRouter } from './report/router';
import { contractAllRouter } from './contract/router';

export const mainRouter: RouteObject = {
  path: '/',
  element: <MainLayout />,
  children: [
    statisticRouter,
    contractRouter,
    financeRouter,
    notFoundRouter,
    settingRouter,
    dashboardRouter,
    reportRouter,
    notificationRouter,
    profileRouter,
  ],
};

export { contractAllRouter }