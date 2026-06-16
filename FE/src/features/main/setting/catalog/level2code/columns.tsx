import { DataTableSelectColumn } from '@/components/data-table';
import { Level2Code } from '@/services/level2code/type';
import { ColumnDef } from '@tanstack/react-table';
import { Level2CodeDelete } from './delete/page';
import { EditLevel2CodeAction } from './edit/page';

export const LEVEL2_CODE_COLUMNS: ColumnDef<Level2Code>[] = [
  DataTableSelectColumn as ColumnDef<Level2Code>,
  {
    accessorKey: 'code',
    header: 'Mã cấp 2',
  },
  {
    accessorKey: 'description',
    header: 'Mô tả',
  },
  {
    accessorKey: 'level1CodeName',
    header: 'Mã cấp 1',
  },
  {
    id: 'action',
    header: () => <div className='text-right w-full pr-4'>Thao tác</div>,
    cell: (props) => (
      <div className='flex items-center gap-1 justify-end'>
        <EditLevel2CodeAction {...props} />
        <Level2CodeDelete {...props} />
      </div>
    ),
  },
];
