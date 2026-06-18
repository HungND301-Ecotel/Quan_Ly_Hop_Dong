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
  service: () => Promise<any> | any;
  form?: UseFormReturn;
  meta?: Record<string, any>;
  data?: TData[];
  pagination?: {
    pageIndex: number;
    pageSize: number;
    onPageChange: (pageIndex: number) => void;
    onPageSizeChange: (pageSize: number) => void;
    onKeywordChange?: (keyword: string) => void;
  };
};

export function useDataTable<TData>({
  keys,
  columns,
  service,
  form,
  meta,
  data: dataProp,
  pagination,
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

  const data = useMemo<TData[]>(() => {
    if (dataProp) return dataProp;
    if (!queryData) return [];
    if (Array.isArray(queryData)) return queryData as TData[];
    if (queryData && typeof queryData === 'object' && Array.isArray((queryData as any).data)) {
      return (queryData as any).data as TData[];
    }
    return [];
  }, [dataProp, queryData]);

  const pageCount = useMemo(() => {
    if (queryData && typeof queryData === 'object' && 'totalPages' in queryData) {
      return (queryData as any).totalPages;
    }
    return 0;
  }, [queryData]);

  const totalCount = useMemo(() => {
    if (queryData && typeof queryData === 'object' && 'totalCount' in queryData) {
      return (queryData as any).totalCount;
    }
    return data.length;
  }, [queryData, data]);

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

  const paginationState = useMemo(() => {
    if (pagination) {
      return {
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
      };
    }
    return undefined;
  }, [pagination]);

  const table = useReactTable({
    data,
    columns,
    autoResetPageIndex: false,
    autoResetExpanded: false,
    autoResetAll: false,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: pagination ? undefined : getPaginationRowModel(),
    getFilteredRowModel: pagination?.onKeywordChange ? undefined : getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    globalFilterFn: 'includesString',
    onGlobalFilterChange: (updater) => {
      const nextFilter = typeof updater === 'function' ? updater(globalFilter) : updater;
      setGlobalFilter(nextFilter);
      if (pagination?.onKeywordChange) {
        pagination.onKeywordChange(nextFilter);
      }
    },
    manualPagination: !!pagination,
    pageCount: pagination ? pageCount : undefined,
    manualFiltering: !!pagination?.onKeywordChange,
    onPaginationChange: (updater) => {
      if (pagination) {
        const nextState = typeof updater === 'function' 
          ? updater({ pageIndex: pagination.pageIndex, pageSize: pagination.pageSize })
          : updater;
        if (nextState.pageIndex !== pagination.pageIndex) {
          pagination.onPageChange(nextState.pageIndex);
        }
        if (nextState.pageSize !== pagination.pageSize) {
          pagination.onPageSizeChange(nextState.pageSize);
        }
      }
    },
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
      ...(paginationState && { pagination: paginationState }),
    },
    meta: {
      refresh,
      loading,
      isEdit,
      setIsEdit,
      form,
      totalCount: pagination ? totalCount : data.length,
      ...meta,
    },
  });

  return { table, data, loading, refresh };
}
