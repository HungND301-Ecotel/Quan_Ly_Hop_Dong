import { DataTableSelectColumn } from '@/components/data-table';
import { ContractStructureCatalog } from '@/services/structure/type';
import { ColumnDef } from '@tanstack/react-table';
import { ContractStructureCatalogDelete } from './delete/page';
import { EditContractStructureCatalogAction } from './edit/page';

export const CONTRACT_STRUCTURE_CATALOG_COLUMNS: ColumnDef<ContractStructureCatalog>[] = [
  DataTableSelectColumn as ColumnDef<ContractStructureCatalog>,
  {
    accessorKey: 'name',
    header: 'Tên hình thức hợp đồng',
  },
  {
    accessorKey: 'isActive',
    header: 'Trạng thái',
    cell: (props) => (
      <span>
        {props.row.original.isActive ? (
          <span className='inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700'>
            Hoạt động
          </span>
        ) : (
          <span className='inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700'>
            Không hoạt động
          </span>
        )}
      </span>
    ),
  },
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