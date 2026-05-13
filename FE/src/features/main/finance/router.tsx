import { Outlet, RouteObject } from 'react-router-dom';
import { BuyFinancePage } from './buy/page';
import { SellFinancePage } from './sell/page';

export const financeRouter: RouteObject = {
  path: '/finance',
  element: <Outlet />,
  children: [
    {
      path: 'buy',
      element: <BuyFinancePage />,
      handle: {
        title: 'Tài chính và công nợ của hợp đồng kinh tế mua',
        description: '/Tài chính - Công nợ /Hợp đồng kinh tế mua',
      },
    },
    {
      path: 'sell',
      element: <SellFinancePage />,
      handle: {
        title: 'Tài chính và công nợ của hợp đồng kinh tế bán',
        description: '/Tài chính - Công nợ /Hợp đồng kinh tế bán',
      },
    },
  ],
};
