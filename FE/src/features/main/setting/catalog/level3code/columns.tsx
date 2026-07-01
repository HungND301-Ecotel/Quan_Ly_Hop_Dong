import { DataTableSelectColumn } from '@/components/data-table';
import { Level3Code } from '@/services/level3code/type';
import { ColumnDef } from '@tanstack/react-table';
import { Level3CodeDelete } from './delete/page';
import { EditLevel3CodeAction } from './edit/page';

export const LEVEL3_CODE_COLUMNS: ColumnDef<Level3Code>[] = [
  DataTableSelectColumn as ColumnDef<Level3Code>,
  {
    accessorKey: 'level1CodeName',
    header: 'Mã cấp 1',
  },
  {
    accessorKey: 'level2CodeName',
    header: 'Mã cấp 2',
  },
  {
    accessorKey: 'code',
    header: 'Mã cấp 3',
  },
  {
    accessorKey: 'description',
    header: 'Ghi chú',
  },
  {
    id: 'action',
    header: () => <div className='text-right w-full pr-4'>Thao tác</div>,
    cell: (props) => (
      <div className='flex items-center gap-1 justify-end'>
        <EditLevel3CodeAction {...props} />
        <Level3CodeDelete {...props} />
      </div>
    ),
  },
];
