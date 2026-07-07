import { DataTableEvent } from '@/components/data-table/types';
import { Form } from '@/components/form/form';
import { FormInput } from '@/components/form/form-input';
import { FormSelect } from '@/components/form/form-select';
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
import { signedContentService } from '@/services/signedContent';
import { SignedContent } from '@/services/signedContent/type';
import { level3CodeService } from '@/services/level3code';
import { zodResolver } from '@hookform/resolvers/zod';
import { EditIcon, PlusIcon, Save } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  SignedContentDefault,
  SignedContentSchema,
  SignedContentValues,
} from './schema';

export function EditSignedContentAction({
  row,
  table,
}: DataTableEvent<SignedContent>) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Lấy danh sách mã cấp 3 cho FormSelect
  const level3Codes = useApi({
    service: level3CodeService.getLevel3CodeList,
  });

  const onRefresh = () => {
    table.options.meta?.refresh();
  };

  const detailService = useCallback(() => {
    if (!row || !open) return;
    return signedContentService.getSignedContentDetail(row.original.id);
  }, [row, open]);

  const detail = useApi({ service: detailService });

  const form = useForm<SignedContentValues>({
    resolver: zodResolver(SignedContentSchema),
    defaultValues: SignedContentDefault,
    mode: 'onSubmit',
  });

  useEffect(() => {
    if (!detail.data) return;
    form.reset({
      title: detail.data.title,
      level3CodeId: detail.data.level3CodeId,
      description: detail.data.description ?? '',
    });
  }, [detail.data, form]);

  useEffect(() => {
    if (!open) {
      form.reset(SignedContentDefault);
    }
  }, [open, form]);

  const onSubmit = async (values: SignedContentValues) => {
    try {
      setLoading(true);
      if (row) {
        await signedContentService.updateSignedContent({
          id: row.original.id,
          ...values,
        });
        toast.success('Cập nhật nội dung ký kết thành công');
      } else {
        await signedContentService.createSignedContent(values);
        toast.success('Tạo mới nội dung ký kết thành công');
      }
      setOpen(false);
      onRefresh();
    } catch {
      toast.error(
        row ? 'Lỗi khi cập nhật nội dung ký kết' : 'Lỗi khi tạo nội dung ký kết'
      );
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
            {row ? 'Chỉnh sửa' : 'Tạo mới'} nội dung ký kết
          </DialogTitle>
          <DialogDescription>
            {row ? 'Chỉnh sửa' : 'Tạo mới'} thông tin nội dung ký kết
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
                name='title'
                label='Tên/Nội dung ký kết hợp đồng'
                placeholder='Nhập tiêu đề nội dung ký kết'
              />
              <FormSelect
                control={form.control}
                name='level3CodeId'
                label='Mã cấp 3'
                placeholder='Chọn mã cấp 3'
                options={
                  level3Codes.data?.map((c) => ({
                    label: `${c.code}`,
                    value: c.id,
                  })) ?? []
                }
              />
            </FormRow>
            <FormRow>
              <FormTextArea
                control={form.control}
                name='description'
                label='Ghi chú'
                placeholder='Nhập ghi chú'
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
              className='min-w-32 bg-blue-600 hover:bg-blue-700'
            >
              <Save className='w-4 h-4 mr-2' />
              {loading ? 'Đang lưu...' : 'Xác nhận'}
            </Button>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
