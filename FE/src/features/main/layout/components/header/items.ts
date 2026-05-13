import { IconName } from 'lucide-react/dynamic';

export type NavigationItem = {
  name: string;
  icon?: IconName;
  url?: string;
  children?: NavigationItem[];
};

export const NavigationItems: NavigationItem[] = [
  {
    name: 'Trang chủ',
    icon: 'layout-dashboard',
    url: '/',
  },
  {
    name: 'Quản lý hợp đồng',
    icon: 'file-pen-line',
    children: [
      {
        name: 'Tất cả hợp đồng',
        icon: 'inspection-panel',
        url: '/contract/all',
      },
      {
        name: 'Hợp đồng lưu trữ',
        icon: 'archive',
        children: [
          {
            name: 'Tất cả hợp đồng lưu trữ',
            icon: 'archive',
            url: '/contract/archive/all',
          },
          {
            name: 'Hợp đồng nguyên tắc mua',
            icon: 'file-badge',
            url: '/contract/template-buy',
          },
          {
            name: 'Hợp đồng nguyên tắc bán',
            icon: 'file-check',
            url: '/contract/template-sell',
          },
          {
            name: 'Hợp đồng kinh tế mua',
            icon: 'shopping-cart',
            children: [
              {
                name: 'Theo dõi công nợ',
                icon: 'clipboard-check',
                url: '/contract/economic-buy',
              },
              {
                name: 'Không theo dõi công nợ',
                icon: 'clipboard-x',
                url: '/contract/economic-buy-no-debt',
              },
            ],
          },
          {
            name: 'Hợp đồng kinh tế bán',
            icon: 'shopping-bag',
            children: [
              {
                name: 'Theo dõi công nợ',
                icon: 'clipboard-check',
                url: '/contract/economic-sell',
              },
              {
                name: 'Không theo dõi công nợ',
                icon: 'clipboard-x',
                url: '/contract/economic-sell-no-debt',
              },
            ],
          },
        ],
      },
      {
        name: 'Hợp đồng phê duyệt',
        icon: 'circle-check-big',
        url: '/contract/approval',
      },
    ],
  },
  {
    name: 'Tài chính - Công nợ',
    icon: 'dollar-sign',
    children: [
      {
        name: 'Hợp đồng kinh tế mua',
        icon: 'banknote-arrow-down',
        url: '/finance/buy',
      },
      {
        name: 'Hợp đồng kinh tế bán',
        icon: 'banknote-arrow-up',
        url: '/finance/sell',
      },
    ],
  },
  {
    name: 'Cài đặt',
    icon: 'settings',
    children: [
      {
        name: 'Danh mục',
        icon: 'folder',
        url: '/setting/catalog',
      },
      {
        name: 'Cấu hình',
        icon: 'wrench',
        url: '/setting/configuration/notification',
      },
      {
        name: 'Cấu hình đồng bộ dữ liệu',
        icon: 'database',
        url: '/setting/configuration/server',
      },
      {
        name: 'Phân quyền',
        icon: 'shield',
        url: '/setting/configuration/permission',
      },
    ],
  },
  {
    name: 'Báo cáo',
    icon: 'trending-up',
    url: '/report',
  },
];