import {
  DataTable,
  DataTableContent,
  DataTableFooter,
  DataTableHeader,
  DataTablePagination,
  DataTableSearch,
  useDataTable,
} from '@/components/data-table';
import { contractAppendixService } from '@/services/contract-appendix';
import { contractNumberService } from '@/services/contract-number';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { CONTRACT_APPENDIX_COLUMNS } from './columns';
import { ContractAppendixDelete } from './delete';
import { ContractAppendixUpsert } from './upsert';

export function ContractAppendixPage() {
  // Fetch contract numbers to use as lookup map
  const { data: contractNumbers = [] } = useQuery({
    queryKey: ['data-table', 'contract-number-lookup'],
    queryFn: contractNumberService.getContractNumberList,
  });

  const contractNumberMap = useMemo(() => {
    return new Map(contractNumbers.map((c) => [c.id, c.number]));
  }, [contractNumbers]);

  const dataTable = useDataTable({
    keys: ['contract-appendix'],
    service: contractAppendixService.getContractAppendixList,
    columns: CONTRACT_APPENDIX_COLUMNS,
    meta: {
      contractNumberMap,
    },
  });

  return (
    <DataTable dataTable={dataTable}>
      <DataTableHeader>
        <ContractAppendixDelete table={dataTable.table} />
        <ContractAppendixUpsert table={dataTable.table} />
        <DataTableSearch />
      </DataTableHeader>

      <DataTableContent />

      <DataTableFooter>
        <DataTablePagination />
      </DataTableFooter>
    </DataTable>
  );
}
