import { createContext, useContext } from 'react';
import { UseDataTableReturn } from './hook';

export type DataTableContextValue<TData> = UseDataTableReturn<TData>;

export const DataTableContext = createContext<
  DataTableContextValue<unknown> | undefined
>(undefined);

export function useDataTableContext<TData>() {
  const context = useContext(DataTableContext);
  if (!context) {
    throw new Error(
      'useDataTableContext must be used within a DataTableContextProvider'
    );
  }
  return context as DataTableContextValue<TData>;
}
