import { DataTableSelectColumn } from '@/components/data-table';
// import { Badge } from '@/components/ui/badge';
import { ContractStructureCatalog } from '@/services/structure/type';
import { ColumnDef } from '@tanstack/react-table';
import { ContractStructureCatalogDelete } from './delete/page';
import { EditContractStructureCatalogAction } from './edit/page';

export const CONTRACT_STRUCTURE_CATALOG_COLUMNS: ColumnDef<ContractStructureCatalog>[] =
  [
    DataTableSelectColumn as ColumnDef<ContractStructureCatalog>,
    {
      accessorKey: 'code',
      header: 'Mã hình thức hợp đồng',
    },
    {
      accessorKey: 'name',
      header: 'Hình thức hợp đồng',
    },
    {
      accessorKey: 'description',
      header: 'Ghi chú',
    },
    // {
    //   accessorKey: 'isActive',
    //   header: 'Trạng thái',
    //   cell: ({ row }) =>
    //     row.original.isActive ? (
    //       <Badge className='bg-green-500 text-white'>Hoạt động</Badge>
    //     ) : (
    //       <Badge className='bg-gray-400 text-white'>Ngừng hoạt động</Badge>
    //     ),
    // },
    {
      id: 'action',
      header: () => <div className='text-right w-full pr-4'>Thao tác</div>,
      cell: (props) => (
        <div className='flex items-center gap-1 justify-end'>
          <EditContractStructureCatalogAction {...props} />
          <ContractStructureCatalogDelete {...props} />
        </div>
      ),
    },
  ];
