import { DataTableEvent } from '@/components/data-table/types';
import { Form } from '@/components/form/form';
import { FormInput } from '@/components/form/form-input';
import { FormRow } from '@/components/form/form-row';
import { FormTextArea } from '@/components/form/form-text-area';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useApi } from '@/hooks/use-api';
import { contractTypeService } from '@/services/contract-type';
import { ContractType } from '@/services/contract-type/type';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  ContractTypeInformationDefault,
  ContractTypeInformationValues,
  ContractTypeSchema,
} from '../upsert/schema';

export function ContractTypeDetail({
  row,
}: Partial<DataTableEvent<ContractType>>) {
  const [open, setOpen] = useState(false);

  const detailService = useCallback(() => {
    if (!row || !open) return;
    return contractTypeService.getContractTypeDetail(row.original.id);
  }, [row, open]);

  const detail = useApi({ service: detailService });

  const form = useForm<ContractTypeInformationValues>({
    resolver: zodResolver(ContractTypeSchema),
    defaultValues: ContractTypeInformationDefault,
  });

  useEffect(() => {
    if (detail.data) {
      form.reset({
        name: detail.data.name,
        code: detail.data.code,
        description: detail.data.description || '',
      });
    }
  }, [detail.data, form]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={'ghost'} size={'icon'}>
          <Eye className='w-4 h-4' />
        </Button>
      </DialogTrigger>

      <DialogContent className='flex flex-col gap-0 w-full md:min-w-2xl lg:min-w-4xl px-0 overflow-hidden'>
        <DialogHeader className='gap-1 p-6 pt-0 border-b'>
          <DialogTitle className='text-2xl font-semibold'>
            Chi tiết loại hợp đồng
          </DialogTitle>
          <DialogDescription>
            Xem thông tin chi tiết loại hợp đồng
          </DialogDescription>
        </DialogHeader>
        <Form context={form} className='flex flex-col overflow-hidden'>
          <div className='flex-1 p-6 flex flex-col gap-6'>
            <FormRow>
              <FormInput
                control={form.control}
                name='name'
                label='Tên loại hợp đồng'
                disabled
              />
              <FormInput
                control={form.control}
                name='code'
                label='Mã loại hợp đồng'
                disabled
              />
            </FormRow>
            <FormTextArea
              control={form.control}
              name='description'
              label='Mô tả'
              disabled
            />
          </div>

          <div className='flex justify-end items-center gap-3 p-4 px-6 pb-0 border-t'>
            <Button
              variant='outline'
              type='button'
              onClick={() => setOpen(false)}
            >
              Đóng
            </Button>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
