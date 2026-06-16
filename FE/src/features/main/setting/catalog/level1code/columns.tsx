import { DataTableSelectColumn } from '@/components/data-table';
import { Level1Code } from '@/services/level1code/type';
import { ColumnDef } from '@tanstack/react-table';
import { EditLevel1CodeAction } from './edit/page';
import { Level1CodeDelete } from './delete/page';

export const LEVEL1_CODE_COLUMNS: ColumnDef<Level1Code>[] = [
  DataTableSelectColumn as ColumnDef<Level1Code>,
  {
    accessorKey: 'code',
    header: 'Mã cấp 1',
  },
  {
    accessorKey: 'description',
    header: 'Mô tả',
  },
  {
    accessorKey: 'contractRegisterName',
    header: 'Sổ theo dõi',
  },
  {
    accessorKey: 'contractTypeName',
    header: 'Loại hợp đồng',
  },
  {
    id: 'action',
    header: () => <div className='text-right w-full pr-4'>Thao tác</div>,
    cell: (props) => (
      <div className='flex items-center gap-1 justify-end'>
        <EditLevel1CodeAction {...props} />
        <Level1CodeDelete {...props} />
      </div>
    ),
  },
];