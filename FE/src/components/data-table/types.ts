/* eslint-disable @typescript-eslint/no-unused-vars */
import { Row, RowData, Table } from '@tanstack/react-table';
import { UseFormReturn } from 'react-hook-form';

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    refresh: Function;
    loading?: boolean;
    isEdit?: boolean;
    setIsEdit?: (value: boolean) => void;
    form?: UseFormReturn;
  }

  interface ColumnMeta<TData extends RowData, TValue> {
    hidden?: boolean;
  }
}

export type DataTableEvent<TData> = {
  table: Table<TData>;
  row?: Row<TData>;
};
