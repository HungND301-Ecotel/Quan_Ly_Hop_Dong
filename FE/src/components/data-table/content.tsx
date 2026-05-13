import { DataTableEvent } from '@/components/data-table/types';
import { cn } from '@/lib/utils';
import { flexRender, Row, Table as TTable } from '@tanstack/react-table';
import { FolderCodeIcon } from 'lucide-react';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '../ui/empty';
import { ScrollArea } from '../ui/scroll-area';
import { Skeleton } from '../ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { useDataTableContext } from './context';

export type DataTableContentProps<TData> = {
  onExpand?: (event: DataTableEvent<TData>) => React.ReactNode;
  className?: string;
};

export function DataTableContent<TData>({
  onExpand,
  className,
}: DataTableContentProps<TData>) {
  const { table, loading } = useDataTableContext();

  return (
    <ScrollArea
      className={cn(
        'overflow-x-auto rounded-md border bg-background shadow-xs',
        className
      )}
    >
      <Table>
        <TableHeader className='bg-accent'>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className='h-14'>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    className='whitespace-normal px-4 py-2'
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {loading ? (
            <>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow>
                  <TableCell key={index} colSpan={table.getAllColumns().length}>
                    <Skeleton className='h-4 bg-neutral-500/50 w-full' />
                  </TableCell>
                </TableRow>
              ))}
            </>
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row, index) => (
              <>
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className='h-14'
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className='px-4 py-2 whitespace-normal'
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>

                {row.getIsExpanded() && (
                  <TableRow
                    key={row.id + index}
                    className='bg-white hover:bg-white'
                  >
                    <TableCell
                      colSpan={row.getVisibleCells().length}
                      className='p-3 bg-muted'
                    >
                      {onExpand?.({
                        table: table as TTable<TData>,
                        row: row as Row<TData>,
                      })}
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={table.getAllColumns().length}>
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant='icon'>
                      <FolderCodeIcon />
                    </EmptyMedia>
                    <EmptyTitle>Không có dữ liệu</EmptyTitle>
                    <EmptyDescription>
                      Không có dữ liệu để hiển thị
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
