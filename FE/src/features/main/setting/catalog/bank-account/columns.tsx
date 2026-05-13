import { DataTableSelectColumn } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { BankAccount } from '@/services/bank-account/type';
import { ColumnDef } from '@tanstack/react-table';
import { BankAccountDelete } from './delete/page';
import { BankAccountEdit } from './edit/page';

export const BANK_ACCOUNT_COLUMNS: ColumnDef<BankAccount>[] = [
  DataTableSelectColumn as ColumnDef<BankAccount>,
  {
    accessorKey: 'bankName',
    header: 'Tên ngân hàng',
  },
  {
    accessorKey: 'accountNumber',
    header: 'Số tài khoản',
  },
  {
    accessorKey: 'accountHolder',
    header: 'Chủ tài khoản',
  },
  {
    accessorKey: 'isActive',
    header: 'Trạng thái',
    cell: ({ row }) =>
      row.original.isActive ? (
        <Badge className='bg-green-500 text-white'>Hoạt động</Badge>
      ) : (
        <Badge className='bg-gray-400 text-white'>Ngừng hoạt động</Badge>
      ),
  },
  {
    id: 'action',
    header: () => <div className='text-right w-full pr-4'>Thao tác</div>,
    cell: (props) => (
      <div className='flex items-center gap-1 justify-end'>
        <BankAccountEdit {...props} />
        <BankAccountDelete {...props} />
      </div>
    ),
  },
];