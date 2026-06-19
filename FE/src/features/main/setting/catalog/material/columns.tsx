import { format } from '@/lib/format';
import { Material } from '@/services/material/type';
import { ColumnDef } from '@tanstack/react-table';
import { EditMaterialAction } from './edit/page';
import { MaterialDelete } from './delete/page';
import { Checkbox } from '@/components/ui/checkbox';

export const MATERIAL_COLUMNS: ColumnDef<Material>[] = [
  {
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
        disabled={row.original.isSynced}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='border-primary'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'materialCode',
    header: 'Mã vật tư, tài sản',
  },
  {
    accessorKey: 'name',
    header: 'Tên vật tư, tài sản',
  },
  {
    accessorKey: 'unitOfMeasureName',
    header: 'Đơn vị tính',
  },
  {
    accessorKey: 'price',
    header: 'Đơn giá vật tư',
    cell: ({ row }) => format.number(row.original.price),
  },
  {
    id: 'action',
    header: () => <div className='text-right w-full pr-4'>Thao tác</div>,
    cell: (props) => {
      const isSynced = props.row.original.isSynced;
      if (isSynced) {
        return (
          <div className='flex items-center gap-1 justify-end text-xs text-muted-foreground italic pr-4 select-none'>
            Đồng bộ
          </div>
        );
      }
      return (
        <div className='flex items-center gap-1 justify-end'>
          <EditMaterialAction {...props} />
          <MaterialDelete {...props} />
        </div>
      );
    },
  },
];
