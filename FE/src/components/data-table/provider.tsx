import { PropsWithChildren } from 'react';
import { DataTableContext, DataTableContextValue } from './context';

export type DataTableProviderProps<TData> = PropsWithChildren<{
  dataTable: DataTableContextValue<TData>;
}>;

export function DataTableProvider<TData>({
  children,
  dataTable,
}: DataTableProviderProps<TData>) {
  return (
    <DataTableContext.Provider
      value={dataTable as DataTableContextValue<unknown>}
    >
      {children}
    </DataTableContext.Provider>
  );
}
