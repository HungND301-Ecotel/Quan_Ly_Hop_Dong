import { useDataTableContext } from '@/components/data-table/context';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { Contract } from '@/services/contract/type';
import { contractService } from '@/services/contract';
import { SendIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ContractStatus, ContractSubStatus } from '@/constants/contract-status';

export function ContractSubmitForApproval() {
  const { table, refresh } = useDataTableContext<Contract>();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectedRows = table.getSelectedRowModel().rows.map((r) => r.original);

  // Chỉ gửi những hợp đồng Draft hoặc Rejected
  const eligibleContracts = useMemo(
    () =>
      selectedRows.filter(
        (c) =>
          c.status === 'Draft' ||
          (c.status === 'PendingApproval' && c.subStatus === 'Rejected')
      ),
    [selectedRows]
  );

  const ineligibleContracts = useMemo(
    () => selectedRows.filter((c) => !eligibleContracts.includes(c)),
    [selectedRows, eligibleContracts]
  );

  const handleSubmit = async () => {
    if (eligibleContracts.length === 0) return;
    try {
      setSubmitting(true);
      await Promise.all(
        eligibleContracts.map((c) => contractService.submitForApproval(c.id))
      );
      toast.success(
        `Đã trình ký ${eligibleContracts.length} hợp đồng thành công`
      );
      table.resetRowSelection();
      setOpen(false);
      refresh();
    } catch {
      toast.error('Có lỗi khi trình ký hợp đồng');
    } finally {
      setSubmitting(false);
    }
  };

  if (selectedRows.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='default' size='sm' className='gap-2'>
          <SendIcon className='size-4' />
          Trình ký
          {eligibleContracts.length > 0 && (
            <span className='ml-1 bg-white/20 text-white text-xs rounded-full px-2 py-0.5 font-semibold'>
              {eligibleContracts.length}
            </span>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Gửi hợp đồng đi ký</DialogTitle>
          <DialogDescription>
            Bạn đã chọn {selectedRows.length} hợp đồng.{' '}
            {eligibleContracts.length > 0 ? (
              <>
                <span className='text-green-600 font-medium'>
                  {eligibleContracts.length} hợp đồng
                </span>{' '}
                đủ điều kiện trình ký.
              </>
            ) : (
              <span className='text-destructive font-medium'>
                Không có hợp đồng nào đủ điều kiện.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 max-h-[60vh] overflow-y-auto'>
          {/* Danh sách hợp đồng sẽ được gửi */}
          {eligibleContracts.length > 0 && (
            <div>
              <div className='text-sm font-semibold text-green-700 mb-2 flex items-center gap-2'>
                <span className='size-2 rounded-full bg-green-500 inline-block' />
                Sẽ được trình ký ({eligibleContracts.length})
              </div>
              <div className='space-y-2'>
                {eligibleContracts.map((contract) => {
                  const status = ContractStatus[contract.status];
                  const subStatus = ContractSubStatus[contract.subStatus];
                  return (
                    <div
                      key={contract.id}
                      className='flex items-center justify-between p-3 rounded-lg border border-green-200 bg-green-50/50'
                    >
                      <div className='min-w-0'>
                        <p className='text-sm font-semibold truncate'>
                          {contract.contractNumber}
                        </p>
                        <p className='text-xs text-muted-foreground truncate'>
                          {contract.title}
                        </p>
                      </div>
                      <div className='flex gap-1 shrink-0 ml-3'>
                        {status && (
                          <span
                            className={cn(
                              'text-xs rounded-full px-2 py-0.5 font-medium whitespace-nowrap',
                              status.background,
                              status.foreground
                            )}
                          >
                            {status.title}
                          </span>
                        )}
                        {subStatus && (
                          <span
                            className={cn(
                              'text-xs rounded-full px-2 py-0.5 font-medium whitespace-nowrap',
                              subStatus.background,
                              subStatus.foreground
                            )}
                          >
                            {subStatus.title}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Danh sách hợp đồng không đủ điều kiện */}
          {ineligibleContracts.length > 0 && (
            <div>
              <div className='text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2'>
                <span className='size-2 rounded-full bg-muted-foreground inline-block' />
                Không đủ điều kiện gửi ({ineligibleContracts.length})
              </div>
              <div className='space-y-2'>
                {ineligibleContracts.map((contract) => {
                  const status = ContractStatus[contract.status];
                  const subStatus = ContractSubStatus[contract.subStatus];
                  return (
                    <div
                      key={contract.id}
                      className='flex items-center justify-between p-3 rounded-lg border bg-muted/30 opacity-60'
                    >
                      <div className='min-w-0'>
                        <p className='text-sm font-semibold truncate'>
                          {contract.contractNumber}
                        </p>
                        <p className='text-xs text-muted-foreground truncate'>
                          {contract.title}
                        </p>
                      </div>
                      <div className='flex gap-1 shrink-0 ml-3'>
                        {status && (
                          <span
                            className={cn(
                              'text-xs rounded-full px-2 py-0.5 font-medium whitespace-nowrap',
                              status.background,
                              status.foreground
                            )}
                          >
                            {status.title}
                          </span>
                        )}
                        {subStatus && (
                          <span
                            className={cn(
                              'text-xs rounded-full px-2 py-0.5 font-medium whitespace-nowrap',
                              subStatus.background,
                              subStatus.foreground
                            )}
                          >
                            {subStatus.title}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || eligibleContracts.length === 0}
            className='gap-2'
          >
            {submitting ? (
              <Spinner />
            ) : (
              <SendIcon className='size-4' />
            )}
            Trình ký
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}