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
import { Edit, PlusIcon, Save } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  ContractTypeInformationDefault,
  ContractTypeInformationValues,
  ContractTypeSchema,
} from './schema';

export function ContractTypeUpsert({
  row,
  table,
}: Partial<DataTableEvent<ContractType>>) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const onRefresh = () => {
    table?.options.meta?.refresh?.();
  };

  const detailService = useCallback(() => {
    if (!row || !open) return;
    return contractTypeService.getContractTypeDetail(row.original.id);
  }, [row, open]);

  const detail = useApi({ service: detailService });

  const form = useForm<ContractTypeInformationValues>({
    resolver: zodResolver(ContractTypeSchema),
    defaultValues: ContractTypeInformationDefault,
    mode: 'onSubmit',
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

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  const onSubmit = async (values: ContractTypeInformationValues) => {
    try {
      setLoading(true);
      if (row) {
        const updateBody: ContractType = {
          id: row.original.id,
          ...values,
          description: values.description || null,
        };
        await contractTypeService.updateContractType(updateBody);
        toast.success('Cập nhật thông tin loại hợp đồng thành công');
      } else {
        await contractTypeService.createContractType({
          ...values,
          description: values.description || null,
        });
        toast.success('Tạo mới loại hợp đồng thành công');
      }
      setOpen(false);
      onRefresh();
    } catch {
      toast.error('Lỗi khi lưu thông tin loại hợp đồng');
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
            <PlusIcon className='w-4 h-4 mr-2' />
            <span>Tạo mới</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className='flex flex-col gap-0 w-full md:min-w-2xl lg:min-w-4xl px-0 overflow-hidden'>
        <DialogHeader className='gap-1 p-6 pt-0 border-b'>
          <DialogTitle className='text-2xl font-semibold'>
            {row ? 'Chỉnh sửa' : 'Tạo mới'} loại hợp đồng
          </DialogTitle>
          <DialogDescription>
            {row ? 'Chỉnh sửa' : 'Tạo mới'} thông tin loại hợp đồng
          </DialogDescription>
        </DialogHeader>
        <Form
          context={form}
          onSubmit={onSubmit}
          className='flex flex-col overflow-hidden'
        >
          <div className='flex-1 p-6 flex flex-col gap-6'>
            <FormRow>
              <FormInput
                control={form.control}
                name='name'
                label='Tên loại hợp đồng'
                placeholder='Nhập tên loại hợp đồng'
              />
              <FormInput
                control={form.control}
                name='code'
                label='Mã loại hợp đồng'
                placeholder='Nhập mã loại hợp đồng'
              />
            </FormRow>
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
              className='min-w-32 bg-blue-600 hover:bg-blue-700'
            >
              <Save className='w-4 h-4 mr-2' />
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
