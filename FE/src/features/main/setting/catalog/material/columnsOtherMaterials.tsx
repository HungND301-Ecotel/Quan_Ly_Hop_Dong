import { DataTableSelectColumn } from '@/components/data-table';
import { format } from '@/lib/format';
import { Material } from '@/services/material/type';
import { ColumnDef } from '@tanstack/react-table';
import { MaterialDelete } from './delete/page';
import { EditOtherMaterialAction } from './edit/EditOtherMaterialAction';

export const OTHER_MATERIAL_COLUMNS: ColumnDef<Material>[] = [
  DataTableSelectColumn as ColumnDef<Material>,
  {
    accessorKey: 'materialCode',
    header: 'Mã thành phần hợp đồng khác',
  },
  {
    accessorKey: 'name',
    header: 'Tên thành phần hợp đồng khác',
  },
  {
    accessorKey: 'unitOfMeasureName',
    header: 'Đơn vị tính',
  },
  {
    accessorKey: 'price',
    header: 'Đơn giá',
    cell: ({ row }) => format.number(row.original.price),
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