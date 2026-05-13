import { DataTableSelectColumn } from '@/components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { UnitOfMeasureDelete } from './delete/page';
import { EditUnitOfMeasureAction } from './edit/page';
import { UnitOfMeasure } from '@/services/unit/type';

export const UNIT_OF_MEASURE_COLUMNS: ColumnDef<UnitOfMeasure>[] = [
  DataTableSelectColumn as ColumnDef<UnitOfMeasure>,
  {
    accessorKey: 'code',
    header: 'Mã đơn vị tính',
  },
  {
    accessorKey: 'name',
    header: 'Tên đơn vị tính',
  },
  {
    id: 'action',
    header: () => <div className='text-right w-full pr-4'>Thao tác</div>,
    cell: (props) => (
      <div className='flex items-center gap-1 justify-end'>
        <EditUnitOfMeasureAction {...props} />
        <UnitOfMeasureDelete {...props} />
      </div>
    ),
  },
];