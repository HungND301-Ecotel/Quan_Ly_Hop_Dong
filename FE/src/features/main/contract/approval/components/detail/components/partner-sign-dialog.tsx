import { Form } from '@/components/form/form';
import { FormFile } from '@/components/form/form-file';
import { FormSelect } from '@/components/form/form-select';
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
import {
  ContractStatus as ContractStatusConst,
  ContractSubStatus as ContractSubStatusConst,
  StatusMapping,
} from '@/constants/contract-status';
import { contractService } from '@/services/contract';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z.object({
  contractFile: z.file(),
  status: z.coerce.number<number>(),
  subStatus: z.coerce.number<number>(),
});

type FormValues = z.infer<typeof formSchema>;

interface PartnerSignDialogProps {
  contractId: string;
  contractNumber: string;
  onSuccess?: () => void;
  children: React.ReactNode;
}

export function PartnerSignDialog({
  contractId,
  contractNumber,
  onSuccess,
  children,
}: PartnerSignDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onSubmit',
  });

  const status = useWatch({
    control: form.control,
    name: 'status',
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const path = await contractService.uploadContract({
        contractFile: values.contractFile,
        contractNumber: contractNumber,
      });

      if (!path) throw new Error();

      await contractService.activateContract({
        contractId,
        status: values.status,
        subStatus: values.subStatus,
        contractFilePath: path,
      });

      toast.success('Cập nhật thành công');
      setOpen(false);
      onSuccess?.();
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  };

  const statusOptions = Object.values(ContractStatusConst).map((value) => ({
    label: value.title,
    value: value.id.toString(),
  }));

  const statusKey = Object.keys(ContractStatusConst).find(
    (key) => ContractStatusConst[key].id.toString() === status?.toString()
  );

  const subStatusOptions =
    statusKey && StatusMapping[statusKey]
      ? StatusMapping[statusKey].map((key) => ({
          label: ContractSubStatusConst[key]?.title || key,
          value: ContractSubStatusConst[key]?.id.toString(),
        }))
      : [];

  const selectedSubStatusKey = statusKey
    ? StatusMapping[statusKey]?.find(
        (key) =>
          ContractSubStatusConst[key]?.id.toString() ===
          form.watch('subStatus')?.toString()
      )
    : undefined;

  const isCancelledBeforeEffective =
    selectedSubStatusKey === 'CancelledBeforeEffective';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='sm:max-w-106.25'>
        <DialogHeader>
          <DialogTitle>Đánh dấu đối tác đã ký</DialogTitle>
          <DialogDescription>
            Tải lên hợp đồng đã ký và cập nhật trạng thái mới.
          </DialogDescription>
        </DialogHeader>
        <Form
          context={form}
          onSubmit={onSubmit}
          className='grid grid-cols-1 gap-4'
        >
          <FormFile
            control={form.control}
            name='contractFile'
            label='File hợp đồng'
            accept='.pdf,.doc,.docx'
            placeholder='Tải file hợp đồng lên'
          />

          {!isCancelledBeforeEffective && (
            <FormSelect
              control={form.control}
              name='status'
              label='Trạng thái'
              placeholder='Chọn trạng thái'
              options={statusOptions}
            />
          )}

          <FormSelect
            control={form.control}
            name='subStatus'
            label='Trạng thái phụ'
            placeholder='Chọn trạng thái phụ'
            options={subStatusOptions}
          />

          <DialogFooter>
            <Button type='submit' disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Spinner className='mr-2' />}
              Lưu
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}