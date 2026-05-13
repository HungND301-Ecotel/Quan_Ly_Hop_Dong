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
import { partnerService } from '@/services/partner';
import { Partner } from '@/services/partner/type';
import { zodResolver } from '@hookform/resolvers/zod';
import { EditIcon, PlusIcon, Save } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  PartnerInformationDefault,
  PartnerInformationValues,
  PartnerSchema,
} from './schema';

export function EditPartnerAction({ row, table }: DataTableEvent<Partner>) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const onRefresh = () => {
    table.options.meta?.refresh();
  };

  const detailService = useCallback(() => {
    if (!row || !open) return;
    return partnerService.getPartnerDetail(row.original.id);
  }, [row, open]);

  const detail = useApi({ service: detailService });

  const form = useForm<PartnerInformationValues>({
    resolver: zodResolver(PartnerSchema),
    defaultValues: PartnerInformationDefault,
    mode: 'onSubmit',
  });

  useEffect(() => {
    if (!detail.data) return;
    form.reset({
      name: detail.data.name,
      taxCode: detail.data.taxCode,
      address: detail.data.address,
      contactPerson: detail.data.contactPerson,
      phone: detail.data.phone,
      email: detail.data.email,
    });
  }, [detail.data, form]);

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  const onSubmit = async (values: PartnerInformationValues) => {
    try {
      if (row) {
        await partnerService.updatePartner({
          id: row.original.id,
          ...values,
        });
      } else {
        await partnerService.createPartner(values);
      }

      toast.success('Cập nhật thông tin đối tác thành công');
      setOpen(false);
      onRefresh();
      table.options.meta?.refresh?.();
    } catch {
      toast.error('Lỗi khi cập nhật thông tin đối tác');
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

      <DialogContent className='flex flex-col gap-0 w-full md:min-w-2xl lg:min-w-4xl px-0 overflow-hidden'>
        <DialogHeader className='gap-1 p-6 pt-0 border-b'>
          <DialogTitle className='text-2xl font-semibold'>
            {row ? 'Chỉnh sửa' : 'Tạo mới'} đối tác
          </DialogTitle>
          <DialogDescription>
            {row ? 'Chỉnh sửa' : 'Tạo mới'} thông tin đối tác
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
                label='Tên đối tác'
                placeholder='Nhập tên đối tác'
              />
              <FormInput
                control={form.control}
                name='taxCode'
                label='Mã số thuế'
                placeholder='Nhập mã số thuế'
              />
            </FormRow>

            <FormRow>
              <FormInput
                control={form.control}
                name='address'
                label='Địa chỉ'
                placeholder='Nhập địa chỉ trụ sở'
              />
            </FormRow>

            <FormRow>
              <FormInput
                control={form.control}
                name='contactPerson'
                label='Người đại diện'
                placeholder='Nhập tên người đại diện'
              />
              <FormInput
                control={form.control}
                name='phone'
                label='Số điện thoại'
                placeholder='Nhập số điện thoại'
              />
            </FormRow>

            <FormRow>
              <FormInput
                control={form.control}
                name='email'
                label='Email liên hệ'
                placeholder='Nhập địa chỉ email'
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
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
