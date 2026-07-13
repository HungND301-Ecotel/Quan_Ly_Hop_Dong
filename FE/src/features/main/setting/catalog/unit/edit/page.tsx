import { DataTableEvent } from '@/components/data-table/types';
import { Form } from '@/components/form/form';
import { FormInput } from '@/components/form/form-input';
import { FormRow } from '@/components/form/form-row';
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
import { zodResolver } from '@hookform/resolvers/zod';
import { EditIcon, PlusIcon, Save } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  UnitOfMeasureDefault,
  UnitOfMeasureSchema,
  UnitOfMeasureValues,
} from './schema';
import { UnitOfMeasure } from '@/services/unit/type';
import { unitOfMeasureService } from '@/services/unit';
import { FormTextArea } from '@/components/form/form-text-area';

export function EditUnitOfMeasureAction({
  row,
  table,
}: DataTableEvent<UnitOfMeasure>) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const onRefresh = () => {
    table.options.meta?.refresh();
  };

  const detailService = useCallback(() => {
    if (!row || !open) return;
    return unitOfMeasureService.getUnitOfMeasureDetail(row.original.id);
  }, [row, open]);

  const detail = useApi({ service: detailService });

  const form = useForm<UnitOfMeasureValues>({
    resolver: zodResolver(UnitOfMeasureSchema),
    defaultValues: UnitOfMeasureDefault,
    mode: 'onSubmit',
  });

  useEffect(() => {
    if (!detail.data) return;
    form.reset({
      code: detail.data.code,
      name: detail.data.name,
      note: detail.data.note ?? '',
    });
  }, [detail.data, form]);

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  const onSubmit = async (values: UnitOfMeasureValues) => {
    try {
      setLoading(true);
      if (row) {
        await unitOfMeasureService.updateUnitOfMeasure({
          id: row.original.id,
          isActive: row.original.isActive,
          ...values,
        });
        toast.success('Cập nhật đơn vị tính thành công');
      } else {
        await unitOfMeasureService.createUnitOfMeasure(values);
        toast.success('Tạo mới đơn vị tính thành công');
      }

      setOpen(false);
      onRefresh();
      table.options.meta?.refresh?.();
    } catch {
      toast.error(
        row ? 'Lỗi khi cập nhật đơn vị tính' : 'Lỗi khi tạo đơn vị tính'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {row ? (
          <Button variant={'ghost'} size={'icon'}>
            <EditIcon />
          </Button>
        ) : (
          <Button variant={'default'} size={'lg'}>
            <PlusIcon />
            <span>Tạo mới</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className='flex flex-col gap-0 w-full md:min-w-xl px-0 overflow-hidden'>
        <DialogHeader className='gap-1 p-6 pt-0 border-b'>
          <DialogTitle className='text-2xl font-semibold'>
            {row ? 'Chỉnh sửa' : 'Tạo mới'} đơn vị tính
          </DialogTitle>
          <DialogDescription>
            {row ? 'Chỉnh sửa' : 'Tạo mới'} thông tin đơn vị tính
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
                name='code'
                label='Mã đơn vị tính'
                placeholder='Nhập mã đơn vị tính'
              />
              <FormInput
                control={form.control}
                name='name'
                label='Tên đơn vị tính'
                placeholder='Nhập tên đơn vị tính'
              />
            </FormRow>
            <FormRow>
              <FormTextArea
                control={form.control}
                name='note'
                label='Ghi chú'
                placeholder='Nhập ghi chú (nếu có)'
                rows={3}
              />
            </FormRow>
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
