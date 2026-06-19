import { DataTableEvent } from '@/components/data-table/types';
import { Form } from '@/components/form/form';
import { FormInput } from '@/components/form/form-input';
import { FormSelect } from '@/components/form/form-select';
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
import { level2CodeService } from '@/services/level2code';
import { Level2Code } from '@/services/level2code/type';
import { level1CodeService } from '@/services/level1code';
import { zodResolver } from '@hookform/resolvers/zod';
import { EditIcon, PlusIcon, Save } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  Level2CodeDefault,
  Level2CodeSchema,
  Level2CodeValues,
} from './schema';

export function EditLevel2CodeAction({ row, table }: DataTableEvent<Level2Code>) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Lấy danh sách mã cấp 1 cho FormSelect
  const level1Codes = useApi({
    service: level1CodeService.getLevel1CodeList,
  });

  const onRefresh = () => {
    table.options.meta?.refresh();
  };

  const detailService = useCallback(() => {
    if (!row || !open) return;
    return level2CodeService.getLevel2CodeDetail(row.original.id);
  }, [row, open]);

  const detail = useApi({ service: detailService });

  const form = useForm<Level2CodeValues>({
    resolver: zodResolver(Level2CodeSchema),
    defaultValues: Level2CodeDefault,
    mode: 'onSubmit',
  });

  useEffect(() => {
    if (!detail.data) return;
    form.reset({
      code: detail.data.code,
      description: detail.data.description,
      level1CodeId: detail.data.level1CodeId,
    });
  }, [detail.data, form]);

  useEffect(() => {
    if (!open) {
      form.reset(Level2CodeDefault);
    }
  }, [open, form]);

  const onSubmit = async (values: Level2CodeValues) => {
    try {
      setLoading(true);
      if (row) {
        await level2CodeService.updateLevel2Code({
          id: row.original.id,
          ...values,
        });
        toast.success('Cập nhật mã cấp 2 thành công');
      } else {
        await level2CodeService.createLevel2Code(values);
        toast.success('Tạo mới mã cấp 2 thành công');
      }
      setOpen(false);
      onRefresh();
    } catch {
      toast.error(row ? 'Lỗi khi cập nhật mã cấp 2' : 'Lỗi khi tạo mã cấp 2');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {row ? (
          <Button variant='ghost' size='icon'>
            <EditIcon />
          </Button>
        ) : (
          <Button variant='default' size='lg'>
            <PlusIcon />
            Tạo mới
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className='flex flex-col gap-0 w-full md:min-w-xl px-0 overflow-hidden'>
        <DialogHeader className='gap-1 p-6 pt-0 border-b'>
          <DialogTitle className='text-2xl font-semibold'>
            {row ? 'Chỉnh sửa' : 'Tạo mới'} mã cấp 2
          </DialogTitle>
          <DialogDescription>
            {row ? 'Chỉnh sửa' : 'Tạo mới'} thông tin mã cấp 2
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
                label='Mã cấp 2'
                placeholder='Nhập mã cấp 2'
              />
              <FormSelect
                control={form.control}
                name='level1CodeId'
                label='Mã cấp 1'
                placeholder='Chọn mã cấp 1'
                options={
                  level1Codes.data?.map((c) => ({
                    label: `${c.code} - ${c.description}`,
                    value: c.id,
                  })) ?? []
                }
              />
            </FormRow>
            <FormInput
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
