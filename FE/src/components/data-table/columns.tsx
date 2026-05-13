import { Checkbox } from '@/components/ui/checkbox';
import { ColumnDef } from '@tanstack/react-table';

export const DataTableIndexColumn: ColumnDef<unknown> = {
  id: 'index',
  header: 'STT',
  cell: ({ row }) => {
    return <span className='font-bold'>{row.index + 1}</span>;
  },
  enableSorting: false,
  enableHiding: false,
};

export const DataTableSelectColumn: ColumnDef<unknown> = {
  id: 'select',
  header: ({ table }) => (
    <Checkbox
      checked={
        table.getIsAllPageRowsSelected() ||
        (table.getIsSomePageRowsSelected() && 'indeterminate')
      }
      onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      aria-label='Select all'
      className='border-primary'
    />
  ),
  cell: ({ row }) => (
    <Checkbox
      checked={row.getIsSelected()}
      onCheckedChange={(value) => row.toggleSelected(!!value)}
      aria-label='Select row'
      className='border-primary'
    />
  ),
  enableSorting: false,
  enableHiding: false,
};
