import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SummarySection } from '@/features/main/finance/buy/components/summary';
import { Contract } from '@/services/contract/type';
import {
  ActivityIcon,
  BadgeAlert,
  CreditCardIcon,
  EditIcon,
  FileTextIcon,
  LayoutGridIcon,
  XIcon,
} from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { ContractInformation } from '../../contract/approval/components/detail/components/information';
import { PaymentSection } from './components/payment';
import { ProgressSection } from './components/progress';
import { useApi } from '@/hooks/use-api';
import { DataTableEvent } from '@/components/data-table/types';
import { contractService } from '@/services/contract';
import { useAuthContext } from '@/features/context';
import { DocumentSection } from './components/DocumentSection';
import { ContractDocuments } from '../../contract/approval/components/detail/components/documents';

export type EconomicContractDetailProps = {
  contract: Contract;
  callback?: () => void;
};

export type ContractDetailProps = {
  onSubmit?: () => Promise<void> | void;
} & DataTableEvent<Contract>;

export function EconomicContractDetail({
  contract,
  callback,
}: EconomicContractDetailProps) {
  const [tab, setTab] = useState('information');
  const [open, setOpen] = useState(false);

  const { user } = useAuthContext();

  const invoiceRef = useRef<HTMLDivElement>(null);
  const taxRef = useRef<HTMLDivElement>(null);

  const scrollToInvoice = useCallback(() => {
    invoiceRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const scrollToTax = useCallback(() => {
    taxRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const detailService = useCallback(() => {
    if (!open) return;
    return contractService.getContractDetail(contract.id);
  }, [open, contract.id]);

  const detail = useApi({ service: detailService });

  const isAdmin = user?.role === 0;
  const contractUserRoles =
    detail.data?.contractUserRoles || contract.contractUserRoles || [];
  const isManager = contractUserRoles.some(
    (r) => r.userId === user?.id && r.role === 1
  );
  const isReceivingOfficer = contractUserRoles.some(
    (r) => r.userId === user?.id && r.role === 3
  );
  const canUpdateProgress = isAdmin || isManager;
  const canSyncDocument = isAdmin || isReceivingOfficer;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={'ghost'} size={'icon'} className='rounded-full'>
          <EditIcon />
        </Button>
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className='flex gap-0 flex-col h-[calc(100vh-4rem)] min-w-[calc(100vw-4rem)] p-0 overflow-hidden'
      >
        <DialogTitle />
        <DialogDescription />
        <Tabs
          defaultValue='information'
          className='gap-0 flex flex-col flex-1 overflow-hidden'
          value={tab}
          onValueChange={setTab}
        >
          <div className='flex items-center gap-4 p-4 px-6 border-b'>
            <TabsList className='w-full bg-muted'>
              <TabsTrigger value='information' className='gap-2'>
                <FileTextIcon className='size-4' />
                <span>Thông tin hợp đồng</span>
              </TabsTrigger>
              <TabsTrigger value='progress' className='gap-2'>
                <ActivityIcon className='size-4' />
                <span>Tiến độ thực hiện hợp đồng</span>
              </TabsTrigger>
              <TabsTrigger value='payment' className='gap-2'>
                <CreditCardIcon className='size-4' />
                <span>Thanh toán hợp đồng</span>
              </TabsTrigger>
              <TabsTrigger value='summary' className='gap-2'>
                <LayoutGridIcon className='size-4' />
                <span>Tổng hợp</span>
              </TabsTrigger>
              <TabsTrigger value='document' className='gap-2'>
                <BadgeAlert className='size-4' />
                <span>Thông tin chứng từ</span>
              </TabsTrigger>
            </TabsList>

            <DialogClose asChild>
              <Button size={'icon-lg'} variant={'destructive'}>
                <XIcon />
              </Button>
            </DialogClose>
          </div>

          <ScrollArea className='flex-1 overflow-hidden bg-muted'>
            <div className='p-6'>
              <TabsContent value='information'>
                {tab === 'information' && (
                  <ContractInformation
                    information={detail.data}
                    loading={detail.loading}
                  />
                )}
              </TabsContent>

              <TabsContent value='progress'>
                {tab === 'progress' && (
                  <ProgressSection
                    contractId={contract.id}
                    contractValue={contract.contractValue}
                    disabled={!canUpdateProgress}
                  />
                )}
              </TabsContent>

              <TabsContent value='payment'>
                {tab === 'payment' && (
                  <>
                    <PaymentSection
                      contractId={contract.id}
                      contractValue={contract.contractValue}
                      onSaved={callback}
                      onNavigateToInvoice={scrollToInvoice}
                      onNavigateToTax={scrollToTax}
                      disabled={!canUpdateProgress}
                    />
                    <div className='mt-8'>
                      <DocumentSection
                        contract={contract}
                        disabled={!canSyncDocument}
                        invoiceRef={invoiceRef}
                        taxRef={taxRef}
                      />
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value='summary'>
                {tab === 'summary' && (
                  <SummarySection
                    contractId={contract.id}
                    contractValue={contract.contractValue}
                  />
                )}
              </TabsContent>

              <TabsContent value='document'>
                {tab === 'document' && (
                  <ContractDocuments
                    loading={detail.loading}
                    documents={[
                      ...(detail.data?.filePath
                        ? detail.data.filePath
                            .split(';')
                            .filter(Boolean)
                            .map((url, i) => ({
                              url,
                              name: detail.data?.contractName
                                ? `${detail.data.contractName}${i > 0 ? ` (${i + 1})` : ''}`
                                : url,
                              group: 'origin' as const,
                            }))
                        : []),
                      ...(detail.data?.signedFilePath
                        ? detail.data.signedFilePath
                            .split(';')
                            .filter(Boolean)
                            .filter((url) => url !== detail.data?.filePath)
                            .map((url, i) => ({
                              url,
                              name: detail.data?.contractName
                                ? `${detail.data.contractName} (đã ký${i > 0 ? ` ${i + 1}` : ''})`
                                : url,
                              group: 'signed' as const,
                            }))
                        : []),
                      ...(detail.data?.attachments ?? []).map((a) => ({
                        url: a.filePath,
                        name: a.fileName,
                        group: 'attachment' as const,
                      })),
                    ]}
                  />
                )}
              </TabsContent>
            </div>
            <ScrollArea />
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
