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
import { level3CodeService } from '@/services/level3code';
import { Level3Code } from '@/services/level3code/type';
import { level1CodeService } from '@/services/level1code';
import { zodResolver } from '@hookform/resolvers/zod';
import { EditIcon, PlusIcon, Save } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  Level3CodeDefault,
  Level3CodeSchema,
  Level3CodeValues,
} from './schema';

export function EditLevel3CodeAction({ row, table }: DataTableEvent<Level3Code>) {
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
    return level3CodeService.getLevel3CodeDetail(row.original.id);
  }, [row, open]);

  const detail = useApi({ service: detailService });

  const form = useForm<Level3CodeValues>({
    resolver: zodResolver(Level3CodeSchema),
    defaultValues: Level3CodeDefault,
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
      form.reset(Level3CodeDefault);
    }
  }, [open, form]);

  const onSubmit = async (values: Level3CodeValues) => {
    try {
      setLoading(true);
      if (row) {
        await level3CodeService.updateLevel3Code({
          id: row.original.id,
          ...values,
        });
        toast.success('Cập nhật mã cấp 3 thành công');
      } else {
        await level3CodeService.createLevel3Code(values);
        toast.success('Tạo mới mã cấp 3 thành công');
      }
      setOpen(false);
      onRefresh();
    } catch {
      toast.error(row ? 'Lỗi khi cập nhật mã cấp 3' : 'Lỗi khi tạo mã cấp 3');
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
            <span>Tạo mới</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className='flex flex-col gap-0 w-full md:min-w-xl px-0 overflow-hidden'>
        <DialogHeader className='gap-1 p-6 pt-0 border-b'>
          <DialogTitle className='text-2xl font-semibold'>
            {row ? 'Chỉnh sửa' : 'Tạo mới'} mã cấp 3
          </DialogTitle>
          <DialogDescription>
            {row ? 'Chỉnh sửa' : 'Tạo mới'} thông tin mã cấp 3
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
                label='Mã cấp 3'
                placeholder='Nhập mã cấp 3'
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
              label='Mô tả'
              placeholder='Nhập mô tả'
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