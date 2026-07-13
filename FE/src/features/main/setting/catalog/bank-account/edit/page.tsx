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
import { BankAccountService } from '@/services/bank-account';
import { BankAccount } from '@/services/bank-account/type';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit, PlusIcon, Save } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  BankAccountDefault,
  BankAccountSchema,
  BankAccountValues,
} from './schema';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { FormTextArea } from '@/components/form/form-text-area';

export function BankAccountEdit({ row, table }: DataTableEvent<BankAccount>) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const onRefresh = () => {
    table.options.meta?.refresh?.();
  };

  const detailService = useCallback(() => {
    if (!row || !open) return;
    return BankAccountService.getBankAccount(row.original.id);
  }, [row, open]);

  const detail = useApi({ service: detailService });

  const form = useForm<BankAccountValues>({
    resolver: zodResolver(BankAccountSchema),
    defaultValues: BankAccountDefault,
    mode: 'onSubmit',
  });

  useEffect(() => {
    if (detail.data) {
      form.reset({
        bankName: detail.data.bankName,
        accountNumber: detail.data.accountNumber,
        accountHolder: detail.data.accountHolder,
        isActive: detail.data.isActive,
        note: detail.data.note ?? '',
      });
    }
  }, [detail.data, form]);

  useEffect(() => {
    if (!open) form.reset(BankAccountDefault);
  }, [open, form]);

  const onSubmit = async (values: BankAccountValues) => {
    try {
      setLoading(true);
      if (row) {
        await BankAccountService.updateBankAccount({
          id: row.original.id,
          ...values,
        });
        toast.success('Cập nhật tài khoản ngân hàng thành công');
      } else {
        await BankAccountService.createBankAccount(values);
        toast.success('Tạo mới tài khoản ngân hàng thành công');
      }
      setOpen(false);
      onRefresh();
    } catch {
      toast.error('Lỗi khi lưu tài khoản ngân hàng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {row ? (
          <Button variant='ghost' size='icon'>
            <Edit />
          </Button>
        ) : (
          <Button variant='default' size='lg'>
            <PlusIcon />
            <span>Tạo mới</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className='flex flex-col gap-0 w-full md:min-w-2xl px-0 overflow-hidden'>
        <DialogHeader className='gap-1 p-6 pt-0 border-b'>
          <DialogTitle className='text-2xl font-semibold'>
            {row ? 'Chỉnh sửa' : 'Tạo mới'} tài khoản ngân hàng
          </DialogTitle>
          <DialogDescription>
            {row ? 'Chỉnh sửa' : 'Nhập'} thông tin tài khoản ngân hàng
          </DialogDescription>
        </DialogHeader>

        <Form
          context={form}
          onSubmit={onSubmit}
          className='flex flex-col overflow-hidden'
        >
          <div className='flex-1 p-6 flex flex-col gap-4'>
            <FormRow>
              <FormInput
                control={form.control}
                name='bankName'
                label='Tên ngân hàng'
                placeholder='VD: Vietcombank, BIDV...'
              />
            </FormRow>
            <FormRow>
              <FormInput
                control={form.control}
                name='accountNumber'
                label='Số tài khoản'
                placeholder='Nhập số tài khoản'
              />
            </FormRow>
            <FormRow>
              <FormInput
                control={form.control}
                name='accountHolder'
                label='Chủ tài khoản'
                placeholder='Nhập tên chủ tài khoản'
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
            <FormRow>
              <div className='flex items-center gap-3'>
                <Switch
                  id='isActive'
                  checked={form.watch('isActive')}
                  onCheckedChange={(val) => form.setValue('isActive', val)}
                />
                <Label htmlFor='isActive'>Đang hoạt động</Label>
              </div>
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
