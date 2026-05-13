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
import { PlayCircleIcon } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z.object({
  reason: z.string().nonempty('Vui lòng nhập lý do tiếp tục'),
});

type FormValues = z.infer<typeof formSchema>;

type ContractResumeProps = {
  contractId: string;
  callback?: () => void;
};

export function ContractResume({ contractId, callback }: ContractResumeProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onSubmit',
    defaultValues: { reason: '' },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await contractService.resumeContract(contractId, values.reason);
      toast.success('Tiếp tục hợp đồng thành công');
      setOpen(false);
      form.reset();
      callback?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Lỗi khi tiếp tục hợp đồng'
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='text-green-600 hover:text-green-600 hover:bg-green-50'
          title='Tiếp tục hợp đồng'
        >
          <PlayCircleIcon className='size-4' />
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Tiếp tục hợp đồng</DialogTitle>
          <DialogDescription>
            Nhập lý do tiếp tục thực hiện hợp đồng.
          </DialogDescription>
        </DialogHeader>
        <Form context={form} onSubmit={onSubmit} className='grid grid-cols-1 gap-4'>
          <FormTextArea
            control={form.control}
            name='reason'
            label='Lý do tiếp tục'
            placeholder='Nhập lý do tiếp tục...'
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
              Xác nhận tiếp tục
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}