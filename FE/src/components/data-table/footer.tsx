import { cn } from '@/lib/utils';
import { ComponentProps } from 'react';

export type DataTableFooterProps = ComponentProps<'div'>;

export function DataTableFooter({ className, ...props }: DataTableFooterProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center gap-3',
        className
      )}
      {...props}
    />
  );
}
