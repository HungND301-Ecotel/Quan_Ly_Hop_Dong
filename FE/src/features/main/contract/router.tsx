import { ContractApprovalRouter } from '@/features/main/contract/approval/router';
import { ContractArchivePage } from '@/features/main/contract/archive/page';
import { Outlet, RouteObject } from 'react-router-dom';
import { ContractAllPage } from './all/page';
import { SpecialLayout } from './all/components/specialLayout';
import { ContractExpiredPage } from './all/ContractExpiredPage';
import { ContractPaymentDuePage } from './all/ContractPaymentDuePage';
import { ContractTemplateBuyPage } from './all/templateBuy/ContractTemplateBuyPage';
import { ContractTemplateSellPage } from './all/teamplateSell/ContractTemplateSellPage';
import { ContractEconomicBuyPage } from './all/economicBuy/ContractEconomicBuyPage';
import { ContractEconomicBuyNoDebtPage } from './all/economicBuy/ContractEconomicBuyNoDebtPage';
import { ContractEconomicSellPage } from './all/economicSell/EconomicSellPage';
import { ContractEconomicSellNoDebtPage } from './all/economicSell/EconomicSellNoDebtPage';
import { ContractArchiveAllPage } from './all/archiveAll';

export const contractRouter: RouteObject = {
  path: '/contract',
  element: <Outlet />,
  children: [
    ContractApprovalRouter,
    {
      path: 'archive/all',
      element: <ContractArchiveAllPage />,
      handle: {
        title: 'Tất cả hợp đồng lưu trữ',
        description: '/Quản lý hợp đồng /Hợp đồng lưu trữ /Tất cả hợp đồng lưu trữ',
      },
    },
    {
      path: 'template-buy',
      element: <ContractTemplateBuyPage />,
      handle: {
        title: 'Hợp đồng nguyên tắc mua',
        description: '/Quản lý hợp đồng /Hợp đồng lưu trữ /Hợp đồng nguyên tắc mua',
      },
    },
    {
      path: 'template-sell',
      element: <ContractTemplateSellPage />,
      handle: {
        title: 'Hợp đồng nguyên tắc bán',
        description: '/Quản lý hợp đồng /Hợp đồng lưu trữ /Hợp đồng nguyên tắc bán',
      },
    },
    {
      path: 'economic-buy',
      element: <ContractEconomicBuyPage />,
      handle: {
        title: 'Theo dõi công nợ hợp đồng kinh tế mua',
        description: '/Quản lý hợp đồng /Hợp đồng lưu trữ /Hợp đồng Kinh tế Mua / Theo dõi công nợ',
      },
    },
    {
      path: 'economic-buy-no-debt',
      element: <ContractEconomicBuyNoDebtPage />,
      handle: {
        title: 'Không theo dõi công nợ hợp đồng kinh tế mua',
        description: '/Quản lý hợp đồng /Hợp đồng lưu trữ /Hợp đồng Kinh tế Mua / Không theo dõi công nợ',
      },
    },
    {
      path: 'economic-sell',
      element: <ContractEconomicSellPage />,
      handle: {
        title: 'Theo dõi công nợ hợp đồng kinh tế bán',
        description: '/Quản lý hợp đồng /Hợp đồng lưu trữ /Hợp đồng Kinh tế Bán / Theo dõi công nợ',
      },
    },
    {
      path: 'economic-sell-no-debt',
      element: <ContractEconomicSellNoDebtPage />,
      handle: {
        title: 'Không theo dõi công nợ hợp đồng kinh tế bán',
        description: '/Quản lý hợp đồng /Hợp đồng lưu trữ /Hợp đồng Kinh tế Bán / Không theo dõi công nợ',
      },
    },
    {
      path: 'archive',
      element: <Outlet />,
      children: [
        {
          index: true,
          element: <ContractArchivePage />,
          handle: {
            title: 'Hợp đồng lưu trữ không theo dõi công nợ',
            description:
              'Xem và quản lý hợp đồng lưu trữ không theo dõi công nợ',
          },
        },
        {
          path: 'debt',
          element: <ContractArchivePage />,
          handle: {
            title: 'Hợp đồng lưu trữ theo dõi công nợ',
            description: 'Xem và quản lý hợp đồng lưu trữ theo dõi công nợ',
          },
        },
      ],
    },
  ],
};

export const contractAllRouter: RouteObject = {
  path: '/contract',
  element: <SpecialLayout />,
  children: [
    {
      path: 'all',
      element: <ContractAllPage />,
      handle: {
        title: 'Tất cả hợp đồng',
        description: '/Quản lý hợp đồng /Tất cả hợp đồng',
      },
    },
    {
      path: 'expired',
      element: <ContractExpiredPage />,
      handle: {
        title: 'Hợp đồng sắp hết hạn',
        description: '/Quản lý hợp đồng /Hợp đồng sắp hết hạn',
      },
    },
    {
      path: 'payment-due',
      element: <ContractPaymentDuePage />,
      handle: {
        title: 'Hợp đồng đến hạn thanh toán',
        description: '/Quản lý hợp đồng /Hợp đồng đến hạn thanh toán',
      },
    },
  ],
};