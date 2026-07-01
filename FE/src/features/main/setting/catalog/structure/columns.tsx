import { DataTableSelectColumn } from '@/components/data-table';
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
