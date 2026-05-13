import { Form } from '@/components/form/form';
import { FormTextArea } from '@/components/form/form-text-area';
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
import { ContractAction } from '@/constants/contract-action';
import { contractService } from '@/services/contract';
import { Contract } from '@/services/contract/type';
import { zodResolver } from '@hookform/resolvers/zod';
import { XIcon } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  ContractRejectDefault,
  ContractRejectSchema,
  ContractRejectValue,
} from './schema';

type ContractRejectProps = {
  contract: Contract;
  onSubmit?: () => Promise<void> | void;
};

export function ContractReject({ contract, onSubmit }: ContractRejectProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<ContractRejectValue>({
    resolver: zodResolver(ContractRejectSchema),
    defaultValues: ContractRejectDefault,
    mode: 'onSubmit',
  });

  const handleSubmit = async (data: ContractRejectValue) => {
    try {
      await contractService.rejectContract({
        rejectionReason: data.reason,
        action: ContractAction.Reject,
        contractId: contract.id,
      });

      toast.success(
        `Từ chối hợp đồng ${contract.contractNumber.toUpperCase()} thành công`
      );
      setOpen(false);
      onSubmit?.();
    } catch {
      toast.error('Từ chối hợp đồng thất bại');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={'destructive'} size={'lg'}>
          <XIcon />
          <span>Từ chối</span>
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <Form context={form} onSubmit={handleSubmit}>
          <DialogHeader className='gap-1'>
            <DialogTitle>
              <span className='text-lg font-semibold'>
                Từ chối hợp đồng {contract.contractNumber.toUpperCase()}
              </span>
            </DialogTitle>
            <DialogDescription>
              Vui lòng nhập lý do từ chối hợp đồng
            </DialogDescription>
          </DialogHeader>

          <FormTextArea
            control={form.control}
            name='reason'
            label='Lý do từ chối'
            placeholder='Nhập lý do từ chối'
          />

          <DialogFooter>
            <DialogClose asChild>
              <Button
                variant={'outline'}
                size={'lg'}
                className='px-4'
                type='button'
              >
                <span>Hủy</span>
              </Button>
            </DialogClose>

            <Button
              size={'lg'}
              variant={'destructive'}
              className='px-4'
              type='submit'
            >
              <span>Xác nhận từ chối</span>
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
