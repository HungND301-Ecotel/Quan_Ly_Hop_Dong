import { DataTableSelectColumn } from '@/components/data-table';
import { UserRole } from '@/constants/user-role';
import { User } from '@/types/user.type';
import { ColumnDef } from '@tanstack/react-table';
import { AccountActionCell } from './account-action-cell';

export const USER_COLUMNS: ColumnDef<User>[] = [
  DataTableSelectColumn as ColumnDef<User>,
  {
    accessorKey: 'userName',
    header: 'Tên đăng nhập',
  },
  {
    accessorKey: 'fullname',
    header: 'Họ và tên',
  },
  {
    accessorKey: 'phoneNumber',
    header: 'Số điện thoại',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'role',
    header: 'Vai trò',
    cell: ({ row }) => {
      const role = row.original.role;
      const roleNumber = parseInt(role);
      return UserRole[roleNumber] || role;
    },
  },
  {
    accessorKey: 'positionName',
    header: 'Chức vụ',
  },
  {
    header: 'Thao tác',
    id: 'action',
    cell: ({ row, table }) => <AccountActionCell row={row} table={table} />,
  },
];
