import { DataTableSelectColumn } from '@/components/data-table';
import { format } from '@/lib/format';
import { Material } from '@/services/material/type';
import { ColumnDef } from '@tanstack/react-table';

export const MATERIAL_COLUMNS: ColumnDef<Material>[] = [
  DataTableSelectColumn as ColumnDef<Material>,
  {
    accessorKey: 'materialCode',
    header: 'Mã thành phần hợp đồng',
  },
  {
    accessorKey: 'name',
    header: 'Tên thành phần hợp đồng',
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
  // {
  //   id: 'action',
  //   header: () => <div className='text-right w-full pr-4'>Thao tác</div>,
  //   cell: (props) => {
  //     return (
  //       <div className='flex items-center gap-1 justify-end'>
  //         <EditMaterialAction {...props} />
  //         <MaterialDelete {...props} />
  //       </div>
  //     );
  //   },
  // },
];
