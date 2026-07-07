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
import { FormSelect } from '@/components/form/form-select';
import { BankAccount } from '@/services/bank-account/type';
import { BankAccountService } from '@/services/bank-account';
import { CreateBankAccountDialog } from '@/components/form/bank-form';

export function EditPartnerAction({ row, table }: DataTableEvent<Partner>) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [openBankDialog, setOpenBankDialog] = useState(false);

  const bankAccountOptions = bankAccounts.map((b) => ({
    value: b.id,
    label: `${b.accountHolder} - ${b.bankName}`,
  }));

  useEffect(() => {
    if (!open) return;
    const fetchData = async () => {
      try {
        const [bankRes] = await Promise.all([
          BankAccountService.getBankAccountList(),
        ]);
        setBankAccounts(bankRes || []);
      } catch (error) {
        console.error('Failed to fetch filter data', error);
      }
    };
    fetchData();
  }, [open]);

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
      partnerContractCode: detail.data.partnerContractCode,
      name: detail.data.name,
      taxCode: detail.data.taxCode,
      address: detail.data.address,
      contactPerson: detail.data.contactPerson,
      phone: detail.data.phone,
      fax: detail.data.fax,
      position: detail.data.position,
      bankId: detail.data.bankId,
      note: detail.data.note,
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
    <>
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

        <DialogContent className='flex flex-col gap-0 w-full md:min-w-2xl lg:min-w-4xl px-0 overflow-hidden max-h-[90vh]'>
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
            className='flex flex-col overflow-hidden flex-1 min-h-0'
          >
            <div className='flex-1 p-6 flex flex-col gap-6 overflow-y-auto min-h-0'>
              <FormRow>
                <FormInput
                  control={form.control}
                  name='partnerContractCode'
                  label='Mã đối tác hợp đồng'
                  placeholder='Nhập mã đối tác hợp đồng'
                />
              </FormRow>

              <FormRow>
                <FormInput
                  control={form.control}
                  name='name'
                  label='Đối tác hợp đồng'
                  placeholder='Nhập tên đối tác'
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
                <div className='flex items-end gap-2 w-full'>
                  <div className='flex-1'>
                    <FormSelect
                      control={form.control}
                      name='bankId'
                      label='Tài khoản ngân hàng'
                      placeholder='Chọn tài khoản ngân hàng'
                      options={bankAccountOptions}
                    />
                  </div>
                  <Button
                    type='button'
                    variant='outline'
                    size='icon'
                    className='mt-6 shrink-0'
                    onClick={() => setOpenBankDialog(true)}
                  >
                    <PlusIcon className='h-4 w-4' />
                  </Button>
                </div>
              </FormRow>

              <FormRow>
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
                  name='phone'
                  label='Điện thoại'
                  placeholder='Nhập số điện thoại'
                />
                <FormInput
                  control={form.control}
                  name='fax'
                  label='Fax'
                  placeholder='Nhập số Fax'
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
                  name='position'
                  label='Chức vụ'
                  placeholder='Nhập chức vụ'
                />
              </FormRow>

              <FormRow>
                <FormInput
                  control={form.control}
                  name='note'
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
      {/* Dialog */}
      <CreateBankAccountDialog
        open={openBankDialog}
        onOpenChange={setOpenBankDialog}
        onSuccess={() => {
          BankAccountService.getBankAccountList().then((data) => {
            setBankAccounts((data || []).filter((a) => a.isActive));
          });
        }}
      />
    </>
  );
}
