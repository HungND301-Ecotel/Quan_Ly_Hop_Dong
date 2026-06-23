// features/main/contract/edit/basic-information/bank-account-select.tsx

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Form } from '@/components/form/form';
import { FormInput } from '@/components/form/form-input';
import { FormRow } from '@/components/form/form-row';
import { BankAccountService } from '@/services/bank-account';
import { BankAccount } from '@/services/bank-account/type';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, ChevronsUpDown, PlusIcon, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm, Control, Path, UseFormSetValue } from 'react-hook-form';
import { BasicInformationValues } from '../../features/main/contract/edit/basic-information/schema';
import {
  BankAccountSchema,
  BankAccountValues,
  BankAccountDefault,
} from '@/features/main/setting/catalog/bank-account/edit/schema';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// Dialog tạo mới tài khoản ngân hàng inline
export function CreateBankAccountDialog({
  onSuccess,
  onOpenChange,
  open: openProp,
}: {
  onSuccess: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);

  const form = useForm<BankAccountValues>({
    resolver: zodResolver(BankAccountSchema),
    defaultValues: BankAccountDefault,
    mode: 'onSubmit',
  });

  const [openInternal, setOpenInternal] = useState(false);

  const open = openProp !== undefined ? openProp : openInternal;
  const setOpen = onOpenChange ?? setOpenInternal;

  useEffect(() => {
    if (!open) form.reset(BankAccountDefault);
  }, [open, form]);

  const onSubmit = async (values: BankAccountValues) => {
    try {
      setLoading(true);
      await BankAccountService.createBankAccount(values);
      toast.success('Tạo mới tài khoản ngân hàng thành công');
      setOpen(false);
      onSuccess();
    } catch {
      toast.error('Lỗi khi tạo mới tài khoản ngân hàng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!onOpenChange && (
        <DialogTrigger asChild>
          <Button
            type='button'
            variant='outline'
            size='icon-lg'
            className='shrink-0 mt-8'
          >
            <PlusIcon className='h-4 w-4' />
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className='flex flex-col gap-0 w-full md:min-w-2xl px-0 overflow-hidden'>
        <DialogHeader className='gap-1 p-6 pt-0 border-b'>
          <DialogTitle className='text-2xl font-semibold'>
            Tạo mới tài khoản ngân hàng
          </DialogTitle>
          <DialogDescription>
            Nhập thông tin tài khoản ngân hàng mới
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

// Props cho BankAccountSelect
type BankAccountSelectProps = {
  control: Control<BasicInformationValues>;
  setValue: UseFormSetValue<BasicInformationValues>;
  bankAccountIdField: Path<BasicInformationValues>;
  label?: string;
  currentId?: string;
};

export function BankAccountSelect({
  setValue,
  bankAccountIdField,
  label = 'Tài khoản ngân hàng',
  currentId,
}: BankAccountSelectProps) {
  const [open, setOpen] = useState(false);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [selected, setSelected] = useState<BankAccount | null>(null);

  useEffect(() => {
    if (currentId && accounts.length > 0) {
      const found = accounts.find((a) => a.id === currentId);
      if (found) setSelected(found);
    }
  }, [currentId, accounts]);

  const loadAccounts = () => {
    BankAccountService.getBankAccountList().then((data) => {
      setAccounts((data || []).filter((a) => a.isActive));
    });
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleSelect = (account: BankAccount) => {
    setSelected(account);
    setValue(bankAccountIdField, account.id as any); // ← chỉ set id
    setOpen(false);
  };

  const handleClear = () => {
    setSelected(null);
    setValue(bankAccountIdField, '' as any);
  };

  return (
    <div className='flex gap-2 items-end col-span-full'>
      <div className='flex flex-col gap-1.5 flex-1 min-w-0'>
        <Label className='text-sm font-medium'>{label}</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild className='w-full min-w-0 overflow-hidden'>
            <Button
              type='button'
              variant='outline'
              role='combobox'
              aria-expanded={open}
              className='w-full justify-between h-10 font-normal gap-2 overflow-hidden'
            >
              <div className='truncate flex-1 min-w-0 text-left text-sm'>
                {selected
                  ? `${selected.accountNumber} — ${selected.bankName} · ${selected.accountHolder}`
                  : 'Tìm kiếm theo số TK, chủ TK, ngân hàng...'}
              </div>
              <ChevronsUpDown className='h-4 w-4 shrink-0 opacity-50' />
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-[var(--radix-popover-trigger-width)] p-0' align='start'>
            <Command>
              <CommandInput placeholder='Tìm số TK, chủ TK, ngân hàng...' />
              <CommandList onWheel={(e) => e.stopPropagation()}>
                <CommandEmpty>Không tìm thấy tài khoản nào.</CommandEmpty>
                <CommandGroup>
                  {accounts.map((account) => (
                    <CommandItem
                      key={account.id}
                      value={`${account.accountNumber} ${account.accountHolder} ${account.bankName}`}
                      onSelect={() => handleSelect(account)}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          selected?.id === account.id
                            ? 'opacity-100'
                            : 'opacity-0'
                        )}
                      />
                      <div className='flex flex-col'>
                        <span className='font-medium'>
                          {account.accountNumber} — {account.bankName}
                        </span>
                        <span className='text-xs text-muted-foreground'>
                          {account.accountHolder}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Nút xóa chọn */}
      {selected && (
        <Button
          type='button'
          variant='ghost'
          size='icon-lg'
          onClick={handleClear}
          className='shrink-0'
        >
          ✕
        </Button>
      )}

      {/* Nút thêm mới inline */}
      <CreateBankAccountDialog onSuccess={loadAccounts} />
    </div>
  );
}