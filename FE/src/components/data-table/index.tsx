import { cn } from '@/lib/utils';
import { ComponentProps } from 'react';
import { DataTableIndexColumn, DataTableSelectColumn } from './columns';
import { DataTableContent } from './content';
import { DataTableContextValue } from './context';
import { DataTableFilterContractStatus } from './filter-contract-status';
import { DataTableFilterContractType } from './filter-contract-type';
import { DataTableFooter } from './footer';
import { DataTableHeader } from './header';
import { useDataTable } from './hook';
import { DataTablePagination } from './pagination';
import { DataTableProvider } from './provider';
import { DataTableSearch } from './search';

export type DataTableProps<TData> = ComponentProps<'div'> & {
  dataTable: DataTableContextValue<TData>;
};

function DataTable<TData>({
  dataTable: table,
  className,
  ...props
}: DataTableProps<TData>) {
  return (
    <DataTableProvider dataTable={table}>
      <div
        className={cn(
          'space-y-3 max-w-full p-3 rounded-lg border bg-background',
          className
        )}
        {...props}
      />
    </DataTableProvider>
  );
}

export {
  DataTable,
  DataTableContent,
  DataTableFilterContractStatus,
  DataTableFilterContractType,
  DataTableFooter,
  DataTableHeader,
  DataTableIndexColumn,
  DataTablePagination,
  DataTableSearch,
  DataTableSelectColumn,
  useDataTable,
};
