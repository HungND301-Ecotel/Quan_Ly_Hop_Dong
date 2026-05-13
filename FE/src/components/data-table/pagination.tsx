import { cn } from '@/lib/utils';
import {
  ChevronFirstIcon,
  ChevronLastIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from 'lucide-react';
import { ComponentProps } from 'react';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useDataTableContext } from './context';

export type DataTablePaginationProps = ComponentProps<'div'>;

export function DataTablePagination({
  className,
  ...props
}: DataTablePaginationProps) {
  const { table } = useDataTableContext();

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 w-full',
        className
      )}
      {...props}
    >
      <div className='flex-1 flex items-center justify-start'>
        <div className='rounded-lg border px-4 flex items-center justify-center h-10 shadow-xs font-medium'>
          <span>{table.getFilteredRowModel().rows.length} bản ghi</span>
        </div>
      </div>

      <div className='flex items-center gap-2 flex-1 justify-center'>
        <Button
          type='button'
          variant='outline'
          size='icon'
          onClick={() => table.setPageIndex(0)}
          disabled={table.getState().pagination.pageIndex === 0}
        >
          <ChevronFirstIcon />
        </Button>

        <Button
          type='button'
          variant='outline'
          size='icon'
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeftIcon />
        </Button>

        <Select
          value={String(table.getState().pagination.pageIndex)}
          onValueChange={(value) => table.setPageIndex(Number(value))}
        >
          <SelectTrigger size='lg' disabled={table.getPageCount() === 0}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent side='bottom' align='center'>
            {table.getPageCount() === 0 ? (
              <SelectItem key={0} value={'0'}>
                Trang 0 / 0
              </SelectItem>
            ) : (
              Array.from({ length: table.getPageCount() }).map((_, index) => (
                <SelectItem key={index} value={`${index}`}>
                  Trang {index + 1} / {table.getPageCount()}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>

        <Button
          type='button'
          variant='outline'
          size='icon'
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <ChevronRightIcon />
        </Button>

        <Button
          type='button'
          variant='outline'
          size='icon'
          onClick={() =>
            table.setPageIndex(Math.max(0, table.getPageCount() - 1))
          }
          disabled={
            table.getPageCount() === 0 ||
            table.getState().pagination.pageIndex === table.getPageCount() - 1
          }
        >
          <ChevronLastIcon />
        </Button>
      </div>

      <div className='flex-1 flex items-center justify-end'>
        <Select
          value={`${table.getState().pagination.pageSize}`}
          onValueChange={(value) => {
            table.setPageSize(Number(value));
          }}
        >
          <SelectTrigger className='data-[size=default]:h-10 w-36'>
            <SelectValue placeholder={table.getState().pagination.pageSize} />
          </SelectTrigger>
          <SelectContent side='bottom' align='end'>
            {[5, 10, 20, 50].map((pageSize) => (
              <SelectItem key={pageSize} value={`${pageSize}`}>
                {pageSize} hàng / trang
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
