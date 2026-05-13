import { DataTableSelectColumn } from '@/components/data-table';
import { Department } from '@/services/department/type';
import { ColumnDef } from '@tanstack/react-table';
import { DepartmentDelete } from './delete/page';
import { DepartmentEdit } from './edit/page';

export const DEPARTMENT_COLUMNS: ColumnDef<Department>[] = [
  DataTableSelectColumn as ColumnDef<Department>,
  {
    accessorKey: 'name',
    header: 'Tên phòng ban',
  },
  {
    accessorKey: 'code',
    header: 'Mã phòng ban',
  },
  {
    id: 'action',
    header: () => <div className='text-right w-full pr-4'>Thao tác</div>,
    cell: (props) => {
      return (
        <div className='flex items-center gap-1 justify-end'>
          <DepartmentEdit {...props} />
          <DepartmentDelete {...props} />
        </div>
      );
    },
  },
];
