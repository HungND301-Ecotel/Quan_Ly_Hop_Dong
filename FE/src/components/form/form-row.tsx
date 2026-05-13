import { cn } from '@/lib/utils';
import { ComponentProps } from 'react';

export function FormRow({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('flex flex-row gap-4', className)} {...props} />;
}
