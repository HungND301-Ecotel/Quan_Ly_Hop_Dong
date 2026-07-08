import { DataTableEvent } from '@/components/data-table/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthContext } from '@/features/context';
import { useApi } from '@/hooks/use-api';
import { contractService } from '@/services/contract';
import { Contract } from '@/services/contract/type';
import {
  ActivityIcon,
  CreditCardIcon,
  EyeIcon,
  FileDigit,
  FileText,
  History,
  Info,
  Workflow,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { ContractAccept } from './components/accept';
import { ContractDocuments } from './components/documents';
import { ContractFlow } from './components/flow';
import { ContractHistory } from './components/history';
import { ContractInformation } from './components/information';
import { ContractReject } from './components/reject';
import { ContractEvidence } from './components/evidence';
import { contractPaymentService } from '@/services/contract-payment';
import { ProgressSection } from '@/features/main/finance/buy/components/progress';
import { PaymentSection } from '@/features/main/finance/buy/components/payment';

export type ContractDetailProps = {
  onSubmit?: () => Promise<void> | void;
} & DataTableEvent<Contract>;

export function ContractDetail({ row, onSubmit }: ContractDetailProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('information');
  const { user } = useAuthContext();

  const detailService = useCallback(() => {
    if (!row || !open) return;
    return contractService.getContractDetail(row.original.id);
  }, [row, open]);

  const historyService = useCallback(() => {
    if (!row || !open) return;
    return contractService.getContractHistory(row.original.id);
  }, [row, open]);

  const schedulesService = useCallback(() => {
    if (!row || !open) return;
    return contractPaymentService.getPaymentSchedules(row.original.id);
  }, [row, open]);

  const paymentsDetailService = useCallback(() => {
    if (!row || !open) return;
    return contractPaymentService.getContractPaymentDetail(row.original.id);
  }, [row, open]);

  const schedules = useApi({ service: schedulesService });
  const paymentsDetail = useApi({ service: paymentsDetailService });

  const detail = useApi({ service: detailService });
  const history = useApi({ service: historyService });

  const canSign = useMemo(() => {
    if (!detail.data?.signingFlows || !user) return false;

    // Filter flows that are pending
    const pendingFlows = detail.data.signingFlows.filter(
      (f) => f.status === 'Pending'
    );

    if (pendingFlows.length === 0) return false;

    // Find the minimum sequence order among pending flows to determine the current turn
    const currentTurnOrder = Math.min(
      ...pendingFlows.map((f) => f.sequenceOrder)
    );

    // Check if the current user is one of the signers for the current turn
    return pendingFlows.some(
      (f) => f.sequenceOrder === currentTurnOrder && f.userId === user.id
    );
  }, [detail.data, user]);

  if (!row) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={'ghost'} size={'icon'}>
          <EyeIcon />
        </Button>
      </DialogTrigger>
      <DialogContent className='flex flex-1 flex-col gap-0 min-w-[calc(100vw-4rem)] px-0 h-[calc(100vh-4rem)] overflow-hidden'>
        <DialogHeader className='gap-1 p-6 pt-0 border-b'>
          <DialogTitle className='text-2xl font-semibold'>
            Chi tiết hợp đồng {row.original.contractNumber.toUpperCase()}
          </DialogTitle>
          <DialogDescription>
            Xem thông tin chi tiết và lịch sử phê duyệt hợp đồng
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className='w-full flex-1 min-h-0 gap-4 py-6 flex flex-col'
        >
          <div className='px-6'>
            <TabsList className='w-full grid grid-cols-7'>
              <TabsTrigger
                value='information'
                className='flex items-center gap-2'
              >
                <Info className='size-4' />
                <span className='hidden md:inline'>Thông tin hợp đồng</span>
              </TabsTrigger>
              <TabsTrigger value='flow' className='flex items-center gap-2'>
                <Workflow className='size-4' />
                <span className='hidden md:inline'>Thành phần ký duyệt</span>
              </TabsTrigger>
              <TabsTrigger value='progress' className='flex items-center gap-2'>
                <ActivityIcon className='size-4' />
                <span className='hidden md:inline'>
                  Tiến độ thực hiện hợp đồng
                </span>
              </TabsTrigger>
              <TabsTrigger value='payment' className='flex items-center gap-2'>
                <CreditCardIcon className='size-4' />
                <span className='hidden md:inline'>Thanh toán hợp đồng</span>
              </TabsTrigger>
              <TabsTrigger
                value='documents'
                className='flex items-center gap-2'
              >
                <FileText className='size-4' />
                <span className='hidden md:inline'>Tài liệu</span>
              </TabsTrigger>
              <TabsTrigger value='history' className='flex items-center gap-2'>
                <History className='size-4' />
                <span className='hidden md:inline'>Lịch sử</span>
              </TabsTrigger>
              <TabsTrigger value='evidence' className='flex items-center gap-2'>
                <FileDigit className='size-4' />
                <span className='hidden md:inline'>Chứng từ</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className={cn('px-6 flex-1 min-h-0', activeTab === 'documents' && 'hidden')}>
            <TabsContent value='information'>
              <ContractInformation
                information={detail.data}
                loading={detail.loading}
              />
            </TabsContent>
            <TabsContent value='progress'>
              {detail.data && (
                <ProgressSection
                  contractId={row.original.id}
                  contractValue={detail.data?.contractValue ?? 0}
                />
              )}
            </TabsContent>
            <TabsContent value='payment'>
              {detail.data && (
                <PaymentSection
                  contractId={row.original.id}
                  contractValue={detail.data.contractValue ?? 0}
                  onSaved={() => {
                    detail.refresh?.();
                  }}
                />
              )}
            </TabsContent>

            <TabsContent value='history'>
              <ContractHistory
                history={history.data || []}
                loading={history.loading}
              />
            </TabsContent>

            <TabsContent value='flow'>
              <ContractFlow
                flow={detail.data?.signingFlows || []}
                loading={detail.loading}
              />
            </TabsContent>

            <TabsContent value='evidence'>
              <ContractEvidence
                payments={paymentsDetail.data?.payments || []}
                days={schedules.data?.[0]?.days ?? 30}
                loading={paymentsDetail.loading || schedules.loading}
              />
            </TabsContent>

            <ScrollBar />
          </ScrollArea>

          <TabsContent value='documents' className='flex-1 min-h-0 px-6'>
            <ContractDocuments
              loading={detail.loading}
              documents={[
                // File hợp đồng gốc (trước khi ký)
                ...(() => {
                  const originUrls = (detail.data?.filePath || '')
                    .split(';')
                    .filter(Boolean);
                  const contractNames = (detail.data?.contractName || '')
                    .split(';')
                    .filter(Boolean);
                  return originUrls.map((url, i) => ({
                    name: contractNames[i] || `File hợp đồng ${i + 1}`,
                    url,
                    group: 'origin' as const,
                  }));
                })(),
                // File hợp đồng đã ký
                ...(() => {
                  const signedUrls = (detail.data?.signedFilePath || '')
                    .split(';')
                    .filter(Boolean);
                  const contractNames = (detail.data?.contractName || '')
                    .split(';')
                    .filter(Boolean);
                  return signedUrls.map((url, i) => ({
                    name: contractNames[i] || `File hợp đồng đã ký ${i + 1}`,
                    url,
                    group: 'signed' as const,
                  }));
                })(),
                ...(detail.data?.attachments || []).map((attachment) => ({
                  name: attachment.fileName,
                  url: attachment.filePath,
                  group: 'attachment' as const,
                })),
              ]}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter className='border-t p-6 pb-0'>
          <DialogClose asChild>
            <Button size={'lg'} variant={'outline'} className='px-4'>
              Đóng
            </Button>
          </DialogClose>

          {canSign && detail.data && (
            <>
              <ContractReject
                contract={detail.data}
                onSubmit={() => {
                  setOpen(false);
                  onSubmit?.();
                }}
              />
              <ContractAccept
                contract={detail.data}
                onSubmit={() => {
                  setOpen(false);
                  onSubmit?.();
                }}
              />
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
