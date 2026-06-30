import { DataTableSelectColumn } from '@/components/data-table';
import { Material } from '@/services/material/type';
import { ColumnDef } from '@tanstack/react-table';
import { MaterialDelete } from './delete/page';
import { EditOtherMaterialAction } from './edit/EditOtherMaterialAction';

export const OTHER_MATERIAL_COLUMNS: ColumnDef<Material>[] = [
  DataTableSelectColumn as ColumnDef<Material>,
  {
    accessorKey: 'materialCode',
    header: 'Mã dịch vụ khác',
  },
  {
    accessorKey: 'name',
    header: 'Tên dịch vụ khác',
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
        <EditOtherMaterialAction {...props} />  {/* ← đúng component */}
        <MaterialDelete {...props} />
      </div>
    ),
  },
];