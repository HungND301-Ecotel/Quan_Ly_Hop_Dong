import { DataTableEvent } from '@/components/data-table/types';
import { Form } from '@/components/form/form';
import { FormInput } from '@/components/form/form-input';
import { FormSelect } from '@/components/form/form-select';
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
import { contractAppendixService } from '@/services/contract-appendix';
import { ContractAppendix } from '@/services/contract-appendix/type';
import { contractNumberService } from '@/services/contract-number';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  ContractAppendixInformationDefault,
  ContractAppendixInformationValues,
  ContractAppendixSchema,
} from '../upsert/schema';

export function ContractAppendixDetail({
  row,
}: Partial<DataTableEvent<ContractAppendix>>) {
  const [open, setOpen] = useState(false);

  // Lấy danh sách Số hợp đồng cho FormSelect
  const contractNumbers = useApi({
    service: contractNumberService.getContractNumberList,
  });

  const detailService = useCallback(() => {
    if (!row || !open) return;
    return contractAppendixService.getContractAppendixDetail(row.original.id);
  }, [row, open]);

  const detail = useApi({ service: detailService });

  const form = useForm<ContractAppendixInformationValues>({
    resolver: zodResolver(ContractAppendixSchema),
    defaultValues: ContractAppendixInformationDefault,
  });

  useEffect(() => {
    if (detail.data) {
      form.reset({
        appendixNumber: detail.data.appendixNumber,
        contractNumberId: detail.data.contractNumberId,
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
            Chi tiết số phụ lục hợp đồng
          </DialogTitle>
          <DialogDescription>
            Xem thông tin chi tiết số phụ lục hợp đồng
          </DialogDescription>
        </DialogHeader>
        <Form context={form} className='flex flex-col overflow-hidden'>
          <div className='flex-1 p-6 flex flex-col gap-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormInput
                control={form.control}
                name='appendixNumber'
                label='Số phụ lục hợp đồng'
                disabled
              />
              <FormSelect
                control={form.control}
                name='contractNumberId'
                label='Số hợp đồng'
                disabled
                placeholder='Chọn số hợp đồng'
                options={
                  contractNumbers.data?.map((c) => ({
                    label: c.number,
                    value: c.id,
                  })) ?? []
                }
              />
            </div>
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
