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
import { Edit, PlusIcon, Save } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  ContractAppendixInformationDefault,
  ContractAppendixInformationValues,
  ContractAppendixSchema,
} from './schema';

export function ContractAppendixUpsert({
  row,
  table,
}: Partial<DataTableEvent<ContractAppendix>>) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Lấy danh sách Số hợp đồng cho FormSelect
  const contractNumbers = useApi({
    service: contractNumberService.getContractNumberList,
  });

  const onRefresh = () => {
    table?.options.meta?.refresh?.();
  };

  const detailService = useCallback(() => {
    if (!row || !open) return;
    return contractAppendixService.getContractAppendixDetail(row.original.id);
  }, [row, open]);

  const detail = useApi({ service: detailService });

  const form = useForm<ContractAppendixInformationValues>({
    resolver: zodResolver(ContractAppendixSchema),
    defaultValues: ContractAppendixInformationDefault,
    mode: 'onSubmit',
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

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  const onSubmit = async (values: ContractAppendixInformationValues) => {
    try {
      setLoading(true);
      if (row) {
        const updateBody: ContractAppendix = {
          id: row.original.id,
          appendixNumber: values.appendixNumber,
          contractNumberId: values.contractNumberId,
          description: values.description || null,
        };
        await contractAppendixService.updateContractAppendix(updateBody);
        toast.success('Cập nhật số phụ lục thành công');
      } else {
        await contractAppendixService.createContractAppendix({
          appendixNumber: values.appendixNumber,
          contractNumberId: values.contractNumberId,
          description: values.description || null,
        });
        toast.success('Tạo mới số phụ lục thành công');
      }
      setOpen(false);
      onRefresh();
    } catch {
      toast.error('Lỗi khi lưu thông tin số phụ lục');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {row ? (
          <Button variant={'ghost'} size={'icon'}>
            <Edit className='w-4 h-4' />
          </Button>
        ) : (
          <Button variant={'default'} size={'lg'}>
            <PlusIcon className='w-4 h-4' />
            <span>Tạo mới</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className='flex flex-col gap-0 w-full md:min-w-2xl lg:min-w-4xl px-0 overflow-hidden'>
        <DialogHeader className='gap-1 p-6 pt-0 border-b'>
          <DialogTitle className='text-2xl font-semibold'>
            {row ? 'Chỉnh sửa' : 'Tạo mới'} số phụ lục hợp đồng
          </DialogTitle>
          <DialogDescription>
            {row ? 'Chỉnh sửa' : 'Tạo mới'} thông tin số phụ lục hợp đồng
          </DialogDescription>
        </DialogHeader>
        <Form
          context={form}
          onSubmit={onSubmit}
          className='flex flex-col overflow-hidden'
        >
          <div className='flex-1 p-6 flex flex-col gap-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormInput
                control={form.control}
                name='appendixNumber'
                label='Số phụ lục hợp đồng'
                placeholder='Nhập số phụ lục hợp đồng'
              />
              <FormSelect
                control={form.control}
                name='contractNumberId'
                label='Số hợp đồng'
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
              label='Ghi chú'
              placeholder='Nhập ghi chú'
            />
          </div>

          <div className='flex justify-end items-center gap-3 p-4 px-6 pb-0 border-t'>
            <Button
              variant='outline'
              type='button'
              onClick={() => setOpen(false)}
            >
              Hủy
            </Button>
            <Button
              type='submit'
              disabled={loading}
              className='bg-blue-600 hover:bg-blue-700'
            >
              <Save className='w-4 h-4' />
              {loading ? 'Đang lưu...' : 'Xác nhận'}
            </Button>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
