/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from '@tanstack/react-query';
import {
  ColumnDef,
  ColumnFiltersState,
  ExpandedState,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { useCallback, useMemo, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';

export type UseDataTableReturn<TData> = ReturnType<typeof useDataTable<TData>>;

export type UseDataTableProps<TData> = {
  keys: string[];
  columns: ColumnDef<TData>[];
  service: () => Promise<TData[] | undefined> | TData[] | undefined;
  form?: UseFormReturn;
  meta?: Record<string, any>;
  data?: TData[];
};

export function useDataTable<TData>({
  keys,
  columns,
  service,
  form,
  meta,
  data: dataProp,
}: UseDataTableProps<TData>) {
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [isEdit, setIsEdit] = useState(false);

  const {
    data: queryData,
    isLoading: loading,
    refetch,
  } = useQuery({
    queryKey: ['data-table', ...keys],
    queryFn: service,
  });

  const data = useMemo(
    () => dataProp || queryData || [],
    [dataProp, queryData]
  );

  const columnVisibility = columns.reduce(
    (acc, col) => {
      if ('accessorKey' in col && col.accessorKey) {
        if (col.meta?.hidden) {
          acc[col.accessorKey as string] = false;
        }
      }
      return acc;
    },
    {} as Record<string, boolean>
  );

  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const table = useReactTable({
    data,
    columns,
    autoResetPageIndex: false,
    autoResetExpanded: false,
    autoResetAll: false,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    globalFilterFn: 'includesString',
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    getRowCanExpand: () => true,
    getExpandedRowModel: getExpandedRowModel(),
    onExpandedChange: (updater) => {
      setExpanded((old) => {
        const oldState = old as Record<string, boolean | undefined>;
        const newState =
          typeof updater === 'function'
            ? (updater(old) as Record<string, boolean | undefined>)
            : (updater as Record<string, boolean | undefined>);
        let changedRowId: string | undefined;
        const allKeys = Object.keys({ ...oldState, ...newState });
        for (const rowId of allKeys) {
          if (oldState[rowId] !== newState[rowId]) {
            changedRowId = rowId;
            break;
          }
        }
        if (!changedRowId) return old;
        const isOpening = newState[changedRowId] === true;
        if (isOpening) {
          return { [changedRowId]: true };
        }
        return {};
      });
    },
    state: {
      columnFilters,
      globalFilter,
      sorting,
      rowSelection,
      columnVisibility,
      expanded,
    },
    meta: {
      refresh,
      loading,
      isEdit,
      setIsEdit,
      form,
      ...meta,
    },
  });

  return { table, data, loading, refresh };
}
