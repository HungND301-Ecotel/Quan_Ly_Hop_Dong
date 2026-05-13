import { Form } from '@/components/form/form';
import { FormTextArea } from '@/components/form/form-text-area';
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
import { contractService } from '@/services/contract';
import { zodResolver } from '@hookform/resolvers/zod';
import { PauseCircleIcon } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z.object({
  reason: z.string().nonempty('Vui lòng nhập lý do tạm dừng'),
});

type FormValues = z.infer<typeof formSchema>;

type ContractPauseProps = {
  contractId: string;
  callback?: () => void;
};

export function ContractPause({ contractId, callback }: ContractPauseProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onSubmit',
    defaultValues: { reason: '' },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await contractService.pauseContract(contractId, values.reason);
      toast.success('Tạm dừng hợp đồng thành công');
      setOpen(false);
      form.reset();
      callback?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Lỗi khi tạm dừng hợp đồng'
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='text-amber-500 hover:text-amber-500 hover:bg-amber-50'
          title='Tạm dừng hợp đồng'
        >
          <PauseCircleIcon className='size-4' />
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Tạm dừng hợp đồng</DialogTitle>
          <DialogDescription>
            Nhập lý do tạm dừng hợp đồng này.
          </DialogDescription>
        </DialogHeader>
        <Form context={form} onSubmit={onSubmit} className='grid grid-cols-1 gap-4'>
          <FormTextArea
            control={form.control}
            name='reason'
            label='Lý do tạm dừng'
            placeholder='Nhập lý do tạm dừng...'
            rows={4}
          />
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => setOpen(false)}
              disabled={form.formState.isSubmitting}
            >
              Hủy
            </Button>
            <Button type='submit' disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Spinner className='mr-2 size-4' />}
              Xác nhận tạm dừng
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}