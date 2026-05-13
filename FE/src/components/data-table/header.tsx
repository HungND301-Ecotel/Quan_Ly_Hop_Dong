import { cn } from '@/lib/utils';
import { ComponentProps } from 'react';

export type DataTableHeaderProps = ComponentProps<'div'>;

export function DataTableHeader({ className, ...props }: DataTableHeaderProps) {
  return (
    <div
      className={cn(
        'flex gap-3 items-center justify-baseline',
        className
      )}
      {...props}
    />
  );
}
