import { Form } from '@/components/form/form';
import { FormFile } from '@/components/form/form-file';
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
import { contractPaymentService } from '@/services/contract-payment';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileCheckIcon } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z.object({
  liquidationFile: z.file(),
});

type FormValues = z.infer<typeof formSchema>;

type ContractLiquidationProps = {
  contractId: string;
  callback?: (filePath: string) => void;
  trigger?: React.ReactNode;
};

export function ContractLiquidation({
  contractId,
  callback,
  trigger,
}: ContractLiquidationProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onSubmit',
  });

  const onSubmit = async (values: FormValues) => {
    try {
      // Bước 1: upload file thanh lý, lấy filePath
      const result = await contractPaymentService.uploadPaymentFile(
        values.liquidationFile,
        contractId,
        'Liquidation'
      );

      if (!result?.filePath) throw new Error('Upload file thất bại');

      // Bước 2: cập nhật liquidationFilePath vào hợp đồng
      await contractPaymentService.updateLiquidationFile(
        contractId,
        result.filePath
      );

      toast.success('Thêm file thanh lý hợp đồng thành công');
      setOpen(false);
      form.reset();
      callback?.(result.filePath);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Có lỗi xảy ra khi thêm file thanh lý'
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
       <DialogTrigger asChild>
        {trigger ?? ( // ✅ dùng trigger tùy chỉnh nếu có, fallback về icon mặc định
          <Button variant='ghost' size='icon' className='text-amber-600 hover:text-amber-600 hover:bg-amber-50'>
            <FileCheckIcon className='size-4' />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Thêm file thanh lý hợp đồng</DialogTitle>
          <DialogDescription>
            Tải lên file thanh lý hợp đồng đã được ký kết.
          </DialogDescription>
        </DialogHeader>
        <Form
          context={form}
          onSubmit={onSubmit}
          className='grid grid-cols-1 gap-4'
        >
          <FormFile
            control={form.control}
            name='liquidationFile'
            label='File thanh lý'
            accept='.pdf,.doc,.docx'
            placeholder='Tải file thanh lý lên'
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
              Lưu
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}