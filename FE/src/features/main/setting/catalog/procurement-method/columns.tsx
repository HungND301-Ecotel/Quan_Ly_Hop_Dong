import { DataTableSelectColumn } from '@/components/data-table';
import { ProcurementMethod } from '@/services/procurement-method/type';
import { ColumnDef } from '@tanstack/react-table';
import { ProcurementMethodActionCell } from './procurement-method-action-cell';
// import { AccountActionCell } from './account-action-cell';

export const PROCUREMENT_METHOD_COLUMNS: ColumnDef<ProcurementMethod>[] = [
  DataTableSelectColumn as ColumnDef<ProcurementMethod>,
  {
    accessorKey: 'code',
    header: 'Mã hình thức',
  },
  {
    accessorKey: 'name',
    header: 'Tên hình thức',
  },
  {
    accessorKey: 'description',
    header: 'Ghi chú',
  },
  {
    header: () => <div className='text-right w-full pr-4'>Thao tác</div>,
    id: 'action',
    cell: ({ row, table }) => (
      <div className='flex items-center gap-1 justify-end'>
        <ProcurementMethodActionCell row={row} table={table} />
      </div>
    ),
  },
];
