import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item';
import { Skeleton } from '@/components/ui/skeleton';
import { SignFlowStatus } from '@/constants/sign-flow-status';
import { SignatureType } from '@/constants/signature-type';
import { format } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Contract } from '@/services/contract/type';
import { CheckCircle2Icon, Clock, XCircle } from 'lucide-react';

export type ContractFlowProps = {
  flow: NonNullable<Contract['signingFlows']>;
  loading?: boolean;
};

export function ContractFlow({ flow, loading }: ContractFlowProps) {
  if (loading) {
    return (
      <div className='space-y-4'>
        {[1, 2, 3].map((i) => (
          <Item key={i} variant='muted' className='border-none'>
            <ItemMedia className='size-10 rounded-full bg-muted animate-pulse' />
            <ItemContent className='space-y-2'>
              <Skeleton className='h-4 w-1/3' />
              <Skeleton className='h-3 w-1/4' />
            </ItemContent>
          </Item>
        ))}
      </div>
    );
  }

  if (!flow || flow.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-12 text-muted-foreground'>
        <p>Không có thông tin luồng ký</p>
      </div>
    );
  }

  return (
    <div className='relative space-y-4 before:absolute before:left-9 before:top-2 before:bottom-2 before:w-0.5 before:bg-border px-4'>
      {flow
        .sort((a, b) => a.sequenceOrder - b.sequenceOrder)
        .map((step) => {
          const isCompleted = step.signedAt !== null;
          const statusConfig = SignFlowStatus[step.status];

          return (
            <div key={step.id} className='relative pl-12'>
              <div
                className={cn(
                  'absolute left-0 top-1/2 -translate-y-1/2 size-10 rounded-full border-background flex items-center justify-center z-10 transition-colors shadow-sm',
                  statusConfig?.background
                )}
              >
                <div className={cn(statusConfig?.foreground)}>
                  {isCompleted ? (
                    <CheckCircle2Icon className='size-6' />
                  ) : step.status === 'REJECTED' ? (
                    <XCircle className='size-6' />
                  ) : (
                    <Clock className='size-6' />
                  )}
                </div>
              </div>

              <Item
                variant='default'
                className={cn(
                  'items-center p-4 rounded-xl border border-border shadow transition-all hover:bg-card hover:shadow-md',
                  isCompleted ? 'bg-green-50/10' : ''
                )}
              >
                <ItemContent className='flex-1'>
                  <div className='flex flex-col gap-1.5'>
                    <div className='flex items-center justify-between gap-2 overflow-hidden'>
                      <ItemTitle className='text-sm font-semibold truncate'>
                        {step.fullName}{' '}
                        <span className='italic font-normal text-muted-foreground'>
                          (@{step.userName})
                        </span>
                      </ItemTitle>

                      <span className='shrink-0 text-[10px] font-bold uppercase tracking-tight text-muted-foreground/40'>
                        {step.departmentName}
                      </span>
                    </div>

                    <div className='flex items-center justify-between gap-2'>
                      <div className='flex items-center gap-2 overflow-hidden'>
                        <span
                          className={cn(
                            'font-semibold px-2 py-0.5 rounded text-xs shrink-0',
                            statusConfig?.background,
                            statusConfig?.foreground || 'bg-muted'
                          )}
                        >
                          {statusConfig?.title || step.status}
                        </span>
                        <ItemDescription className='text-xs bg-neutral-200 text-muted-foreground truncate font-medium px-2 py-0.5 rounded'>
                          {SignatureType[step.signatureType] ||
                            'Không xác định'}
                        </ItemDescription>
                      </div>
                      {step.signedAt && (
                        <span className='shrink-0 text-[10px] text-muted-foreground/60 font-medium italic'>
                          {format.dateTime(step.signedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </ItemContent>
              </Item>
            </div>
          );
        })}
    </div>
  );
}
