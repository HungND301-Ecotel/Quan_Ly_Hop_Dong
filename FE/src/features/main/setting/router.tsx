import { Navigate, Outlet, RouteObject } from 'react-router-dom';
import { AccountManagementPage } from './catalog/account/page';
import { ContractRegisterManagementPage } from './catalog/contract-register/page';
import { ContractTypePage } from './catalog/contract-type/page';
import { DepartmentManagementPage } from './catalog/department/page';
import { SettingInformationLayout } from './catalog/layout';
import { MaterialManagementPage } from './catalog/material/page';
import { PartnerManagementPage } from './catalog/partner/page';
import { ProcurementMethodPage } from './catalog/procurement-method/page';
import NotificationConfig from './notification/NotificationConfig';
import ThreeTierPermissionPage from './permission/PermissionConfig';
import { OtherMaterialManagementPage } from './catalog/material/AnotherMaterialPage';
import { BankAccountManagementPage } from './catalog/bank-account/page';
import { UnitOfMeasureManagementPage } from './catalog/unit/page';
import { Level1CodeManagementPage } from './catalog/level1code/page';
import { Level2CodeManagementPage } from './catalog/level2code/page';
import { Level3CodeManagementPage } from './catalog/level3code/page';
import { SignedContentManagementPage } from './catalog/signedContent/page';
import { ContractStructureCatalogManagementPage } from './catalog/structure/page';
import { ContractFieldPage } from './catalog/contract-field/page';
import { ExternalSyncConfigPage } from './server/ExternalSyncConfigPage';

export const settingRouter: RouteObject = {
  path: '/setting',
  element: <Outlet />,
  children: [
    {
      index: true,
      element: <Navigate to='catalog' replace />,
    },
    {
      path: 'catalog',
      element: <SettingInformationLayout />,
      children: [
        {
          index: true,
          element: <Navigate to='partner' replace />,
        },
        {
          path: 'partner',
          element: <PartnerManagementPage />,
          handle: {
            title: 'Quản lý đối tác',
            description: 'Quản lý thông tin đối tác',
          },
        },
        {
          path: 'level1',
          element: <Level1CodeManagementPage />,
          handle: {
            title: 'Quản lý mã cấp 1',
            description: 'Quản lý danh mục mã cấp 1',
          },
        },
        {
          path: 'level2',
          element: <Level2CodeManagementPage />,
          handle: {
            title: 'Quản lý mã cấp 2',
            description: 'Quản lý danh mục mã cấp 2',
          },
        },
        {
          path: 'level3',
          element: <Level3CodeManagementPage />,
          handle: {
            title: 'Quản lý mã cấp 3',
            description: 'Quản lý danh mục mã cấp 3',
          },
        },
        {
          path: 'signing-content',
          element: <SignedContentManagementPage />,
          handle: {
            title: 'Quản lý nội dung ký kết',
            description: 'Quản lý danh mục nội dung ký kết hợp đồng',
          },
        },
        {
          path: 'contract-structure',
          element: <ContractStructureCatalogManagementPage />,
          handle: {
            title: 'Quản lý hình thức hợp đồng',
            description: 'Quản lý danh mục hình thức hợp đồng',
          },
        },
        {
          path: 'department',
          element: <DepartmentManagementPage />,
          handle: {
            title: 'Quản lý phòng ban',
            description: 'Quản lý thông tin phòng ban',
          },
        },
        {
          path: 'account',
          element: <AccountManagementPage />,
          handle: {
            title: 'Quản lý tài khoản',
            description: 'Quản lý thông tin tài khoản',
          },
        },
        {
          path: 'contract-type',
          element: <ContractTypePage />,
          handle: {
            title: 'Quản lý loại hợp đồng',
            description: 'Quản lý thông tin loại hợp đồng',
          },
        },
        {
          path: 'procurement-method',
          element: <ProcurementMethodPage />,
          handle: {
            title: 'Quản lý hình thức lựa chọn nhà thầu',
            description: 'Quản lý danh mục hình thức lựa chọn nhà thầu',
          },
        },
        {
          path: 'contract-register',
          element: <ContractRegisterManagementPage />,
          handle: {
            title: 'Quản lý số theo dõi hợp đồng',
            description: 'Quản lý số theo dõi hợp đồng',
          },
        },
        {
          path: 'bank-account',
          element: <BankAccountManagementPage />,
          handle: {
            title: 'Quản lý tài khoản ngân hàng',
            description: 'Quản lý thông tin tài khoản ngân hàng',
          },
        },
        {
          path: 'unit',
          element: <UnitOfMeasureManagementPage />,
          handle: {
            title: 'Quản lý đơn vị tính',
            description: 'Quản lý thông tin đơn vị tính',
          },
        },
        {
          path: 'material',
          element: <MaterialManagementPage />,
          handle: {
            title: 'Quản lý thành phần hợp đồng vật tư',
            description: 'Quản lý thông tin thành phần vật tư hợp đồng',
          },
        },
        {
          path: 'contract-field',
          element: <ContractFieldPage />,
          handle: {
            title: 'Quản lý lĩnh vực hợp đồng',
            description: 'Quản lý danh mục lĩnh vực hợp đồng',
          },
        },
        {
          path: 'material/other',
          element: <OtherMaterialManagementPage />,
          handle: {
            title: 'Quản lý thành phần hợp đồng khác',
            description: 'Quản lý thông tin thành phần hợp đồng khác',
          },
        },
      ],
    },
    {
      path: 'configuration',

      children: [
        {
          index: true,
          element: <Navigate to='notification' replace />,
        },
        {
          path: 'notification',
          handle: {
            title: 'Cấu hình thông báo',
            description: 'Quản lý các thông báo liên quan đến hợp đồng',
          },
          element: <NotificationConfig />,
        },
        {
          // ← THÊM ROUTE MỚI
          path: 'server',
          handle: {
            title: 'Cấu hình đồng bộ dữ liệu',
            description: 'Quản lý cấu hình kết nối cơ sở dữ liệu bên ngoài',
          },
          element: <ExternalSyncConfigPage />,
        },
        {
          path: 'Permission',
          handle: {
            title: 'Cấu hình phân quyền',
            description: 'Quản lý các phân quyền cho trang web',
          },
          element: <ThreeTierPermissionPage />,
        },
      ],
    },
  ],
};