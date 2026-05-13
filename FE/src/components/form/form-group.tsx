import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { PropsWithChildren } from 'react';

export type FormGroupProps = {
  className?: string;
} & PropsWithChildren;

export function FormGroup({ children, className }: FormGroupProps) {
  return <Card className={cn('gap-0 p-0', className)}>{children}</Card>;
}

export type FormGroupLabelProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;

export function FormGroupLabel({
  children,
  className,
  ...props
}: FormGroupLabelProps) {
  return (
    <CardTitle className={cn('text-base text-primary', className)} {...props}>
      {children}
    </CardTitle>
  );
}

export type FormGroupHeaderProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;

export function FormGroupHeader({
  children,
  className,
  ...props
}: FormGroupHeaderProps) {
  return (
    <CardHeader
      className={cn('p-4 border-b gap-0 [.border-b]:pb-4 font-bold', className)}
      {...props}
    >
      {children}
    </CardHeader>
  );
}

export type FormGroupContentProps = {
  className?: string;
} & PropsWithChildren;

export function FormGroupContent({
  children,
  className,
}: FormGroupContentProps) {
  return (
    <CardContent className={cn('gap-4 p-4 space-y-4', className)}>
      {children}
    </CardContent>
  );
}
