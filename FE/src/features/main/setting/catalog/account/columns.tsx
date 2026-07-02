import { DataTableSelectColumn } from '@/components/data-table';
import { User } from '@/types/user.type';
import { ColumnDef } from '@tanstack/react-table';
import { AccountActionCell } from './account-action-cell';

export const USER_COLUMNS: ColumnDef<User>[] = [
  DataTableSelectColumn as ColumnDef<User>,
  {
    accessorKey: 'employeeCode',
    header: 'Mã nhân viên',
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
    accessorKey: 'positionName',
    header: 'Chức vụ',
  },
  {
    accessorKey: 'departmentName',
    header: 'Phòng ban',
  },
  {
    accessorKey: 'userName',
    header: 'Tên đăng nhập',
  },
  {
    accessorKey: 'note',
    header: 'Ghi chú',
  },
  {
    header: 'Thao tác',
    id: 'action',
    cell: ({ row, table }) => <AccountActionCell row={row} table={table} />,
  },
];
