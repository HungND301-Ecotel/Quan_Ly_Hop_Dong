import { DataTableSelectColumn } from '@/components/data-table';
import { ContractAppendix } from '@/services/contract-appendix/type';
import { ColumnDef } from '@tanstack/react-table';
import { ContractAppendixDelete } from './delete';
import { ContractAppendixDetail } from './detail';
import { ContractAppendixUpsert } from './upsert';

export const CONTRACT_APPENDIX_COLUMNS: ColumnDef<ContractAppendix>[] = [
  DataTableSelectColumn as ColumnDef<ContractAppendix>,
  {
    accessorKey: 'appendixNumber',
    header: 'Số phụ lục hợp đồng',
  },
  {
    accessorKey: 'contractNumberId',
    header: 'Số hợp đồng',
    cell: ({ getValue, table }) => {
      const contractNumberId = getValue() as string;
      const contractNumberMap = (table.options.meta as any)?.contractNumberMap;
      return contractNumberMap?.get(contractNumberId) || contractNumberId;
    },
  },
  {
    accessorKey: 'description',
    header: 'Mô tả',
  },
  {
    id: 'action',
    header: () => <div className='text-right w-full pr-4'>Thao tác</div>,
    cell: (props) => {
      return (
        <div className='flex items-center gap-1 justify-end'>
          <ContractAppendixDetail {...props} />
          <ContractAppendixUpsert {...props} />
          <ContractAppendixDelete {...props} />
        </div>
      );
    },
  },
];
