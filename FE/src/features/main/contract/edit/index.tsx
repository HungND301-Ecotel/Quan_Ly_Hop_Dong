import { Stepper, StepperProvider } from '@/components/stepper';
import { useStepperContext } from '@/components/stepper/context';
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
import { ContractEditProvider } from '@/features/main/contract/edit/provider';
import { CONTRACT_EDIT_STEPS } from '@/features/main/contract/edit/steps';
import { DynamicIcon } from 'lucide-react/dynamic';
import { useState } from 'react';

interface ContractEditProps {
  callback?: () => void | Promise<void>;
  contractId?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ContractEdit({
  callback,
  contractId,
  open: externalOpen,
  onOpenChange,
}: ContractEditProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  return (
    <DialogProvider open={open} setOpen={setOpen}>
      <Dialog open={open} onOpenChange={setOpen}>
        {/* CHỈ hiển thị trigger khi KHÔNG có external control */}
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
          <StepperProvider steps={CONTRACT_EDIT_STEPS}>
            <ContractEditProvider
              contractId={contractId}
              callback={() => {
                setOpen(false);
                callback?.();
              }}
            >
              <DialogHeader className='border-b h-fit p-6 bg-background'>
                <DialogTitle className='text-xl'>
                  <ContractEditTitle /> <ContractEditSubTitle />
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

function ContractEditTitle() {
  const { isUpdate } = useContractEditContext();

  return isUpdate ? 'Cập nhật' : 'Tạo mới';
}

function ContractEditSubTitle() {
  const { contractFormat } = useContractEditContext();
  const { isFirst } = useStepperContext();

  let title = 'hợp đồng phê duyệt';

  if (isFirst) return title;

  if (
    contractFormat?.contractFormat !== undefined &&
    contractFormat?.contractFormat !== null
  ) {
    title =
      ContractFormat[contractFormat.contractFormat].name.toLocaleLowerCase();
  }

  return title;
}
