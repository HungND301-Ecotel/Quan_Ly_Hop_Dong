import { Stepper, StepperProvider } from '@/components/stepper';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogProvider,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { ContractFormat } from '@/constants/contract-format';
import { useContractEditContext } from '@/features/main/contract/edit/context';
import { CONTRACT_ARCHIVE_STEPS } from '@/features/main/contract/archive/create/steps';
import { ContractEditProvider } from '@/features/main/contract/edit/provider';
import { DynamicIcon } from 'lucide-react/dynamic';
import { useState } from 'react';

export type ContractArchiveCreateProps = {
  callback?: () => void | Promise<void>;
  contractId?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultFormat?: number;
  defaultIsDebtTracking?: boolean;
};

export function ContractArchiveCreate({
  callback,
  contractId,
  open: externalOpen,
  onOpenChange,
  defaultFormat,
  defaultIsDebtTracking,
}: ContractArchiveCreateProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  return (
    <DialogProvider open={open} setOpen={setOpen}>
      <Dialog open={open} onOpenChange={setOpen}>
        {externalOpen === undefined && (
          <DialogTrigger asChild>
            {contractId ? (
              <Button variant='ghost' size={'icon'}>
                <DynamicIcon name='pencil' />
              </Button>
            ) : (
              <Button variant='default' size={'lg'} className='px-4'>
                <DynamicIcon name='plus' />
                <span>Tạo mới hợp đồng</span>
              </Button>
            )}
          </DialogTrigger>
        )}

        <DialogContent className='h-[calc(100vh-4rem)] min-w-[calc(100vw-4rem)] bg-muted p-0 overflow-hidden gap-0 pb-18'>
          <StepperProvider steps={CONTRACT_ARCHIVE_STEPS}>
            <ContractEditProvider
              contractId={contractId}
              defaultFormat={defaultFormat}
              defaultIsDebtTracking={defaultIsDebtTracking}
              callback={() => {
                setOpen(false);
                callback?.();
              }}
            >
              <DialogHeader className='border-b h-fit p-6 bg-background'>
                <DialogTitle className='text-xl'>
                  <ContractArchiveTitle />{' '}
                  <ContractArchiveSubTitle defaultFormat={defaultFormat} />
                </DialogTitle>
                <DialogDescription hidden />
              </DialogHeader>

              <ScrollArea className='flex-1 overflow-hidden bg-muted'>
                <div className='flex flex-col h-full flex-1 p-6'>
                  <Stepper className='flex-1 h-full' />
                </div>
                <ScrollBar orientation='vertical' />
                <ScrollBar orientation='horizontal' />
              </ScrollArea>
            </ContractEditProvider>
          </StepperProvider>
        </DialogContent>
      </Dialog>
    </DialogProvider>
  );
}

function ContractArchiveTitle() {
  const { isUpdate } = useContractEditContext();

  return isUpdate ? 'Cập nhật' : 'Tạo mới';
}

function ContractArchiveSubTitle({
  defaultFormat,
}: {
  defaultFormat?: number;
}) {
  const { contractFormat } = useContractEditContext();

  const currentFormat =
    contractFormat?.contractFormat !== undefined &&
    contractFormat?.contractFormat !== null
      ? contractFormat.contractFormat
      : defaultFormat;

  if (currentFormat !== undefined && currentFormat !== null) {
    return ContractFormat[currentFormat].name.toLocaleLowerCase();
  }

  return 'hợp đồng lưu trữ';
}
