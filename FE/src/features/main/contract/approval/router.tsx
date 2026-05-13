import { ContractHistoryPage } from '@/features/main/contract/approval/history/page';
import { ContractApprovalLayout } from '@/features/main/contract/approval/layout';
import { ContractApprovalPage } from '@/features/main/contract/approval/all';
import { ContractPendingPage } from '@/features/main/contract/approval/pending/page';
import { RouteObject } from 'react-router-dom';

export const ContractApprovalRouter: RouteObject = {
  path: 'approval',
  element: <ContractApprovalLayout />,
  handle: {
    title: 'Quản lý hợp đồng phê duyệt',
    description: 'Xem và quản lý hợp đồng phê duyệt',
  },
  children: [
    {
      index: true,
      element: <ContractApprovalPage />,
    },
    {
      path: 'pending',
      element: <ContractPendingPage />,
    },
    {
      path: 'history',
      element: <ContractHistoryPage />,
    },
  ],
};
