import { DataTableEvent } from '@/components/data-table/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useApi } from '@/hooks/use-api';
import { BankAccountService } from '@/services/bank-account';
import { BankAccount } from '@/services/bank-account/type';
import { partnerService } from '@/services/partner';
import { Partner } from '@/services/partner/type';
import {
  Briefcase,
  Building2,
  EyeIcon,
  Hash,
  MapPin,
  Phone,
  Printer,
  User,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

export function PartnerDetail({ row }: DataTableEvent<Partner>) {
  const [open, setOpen] = useState(false);

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);

  useEffect(() => {
    if (!open) return;
    const fetchData = async () => {
      const [bankRes] = await Promise.all([
        BankAccountService.getBankAccountList(),
      ]);
      setBankAccounts(bankRes || []);
    };
    fetchData();
  }, [open]);

  const detailService = useCallback(() => {
    if (!row || !open) return;
    return partnerService.getPartnerDetail(row.original.id);
  }, [row, open]);

  const detail = useApi({ service: detailService });
  if (!row) return null;

  const positionName = detail.data?.position;

  const bankAccount = bankAccounts.find((b) => b.id === detail.data?.bankId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={'ghost'} size={'icon'}>
          <EyeIcon />
        </Button>
      </DialogTrigger>
      <DialogContent className='flex flex-col gap-0 w-full md:min-w-2xl lg:min-w-4xl px-0 h-[calc(100vh-4rem)] overflow-hidden'>
        <DialogHeader className='gap-1 p-6 pt-0 border-b'>
          <DialogTitle className='text-2xl font-semibold'>
            Chi tiết đối tác
          </DialogTitle>
          <DialogDescription>Xem thông tin chi tiết đối tác</DialogDescription>
        </DialogHeader>

        <ScrollArea className='flex-1 px-6'>
          <div className='py-6'>
            <div className='divide-y divide-slate-100'>
              {/* Đối tác hợp đồng */}
              <div className='flex flex-col sm:flex-row sm:items-center py-4'>
                <Label className='text-muted-foreground w-full sm:w-52 flex items-center gap-2 shrink-0'>
                  <Building2 className='w-4 h-4' /> Đối tác hợp đồng
                </Label>
                <p className='font-medium text-base'>
                  {detail.data?.name || '---'}
                </p>
              </div>

              {/* Địa chỉ */}
              <div className='flex flex-col sm:flex-row sm:items-start py-4'>
                <Label className='text-muted-foreground w-full sm:w-52 flex items-center gap-2 shrink-0 mt-1'>
                  <MapPin className='w-4 h-4' /> Địa chỉ
                </Label>
                <p className='font-medium text-base'>
                  {detail.data?.address || '---'}
                </p>
              </div>

              {/* Mã số thuế */}
              <div className='flex flex-col sm:flex-row sm:items-center py-4'>
                <Label className='text-muted-foreground w-full sm:w-52 flex items-center gap-2 shrink-0'>
                  <Hash className='w-4 h-4' /> Mã số thuế
                </Label>
                <p className='font-medium text-base'>
                  {detail.data?.taxCode || '---'}
                </p>
              </div>

              {/* Số điện thoại */}
              <div className='flex flex-col sm:flex-row sm:items-center py-4'>
                <Label className='text-muted-foreground w-full sm:w-52 flex items-center gap-2 shrink-0'>
                  <Phone className='w-4 h-4' /> Số điện thoại
                </Label>
                <p className='font-medium text-base'>
                  {detail.data?.phone || '---'}
                </p>
              </div>

              {/* Fax */}
              <div className='flex flex-col sm:flex-row sm:items-center py-4'>
                <Label className='text-muted-foreground w-full sm:w-52 flex items-center gap-2 shrink-0'>
                  <Printer className='w-4 h-4' /> Fax
                </Label>
                <p className='font-medium text-base'>
                  {detail.data?.fax || '---'}
                </p>
              </div>

              {/* Người đại diện */}
              <div className='flex flex-col sm:flex-row sm:items-center py-4'>
                <Label className='text-muted-foreground w-full sm:w-52 flex items-center gap-2 shrink-0'>
                  <User className='w-4 h-4' /> Người đại diện
                </Label>
                <p className='font-medium text-base'>
                  {detail.data?.contactPerson || '---'}
                </p>
              </div>

              {/* Chức vụ */}
              <div className='flex flex-col sm:flex-row sm:items-center py-4'>
                <Label className='text-muted-foreground w-full sm:w-52 flex items-center gap-2 shrink-0'>
                  <Briefcase className='w-4 h-4' /> Chức vụ
                </Label>
                <p className='font-medium text-base'>{positionName || '---'}</p>
              </div>

              {/* Tài khoản ngân hàng */}
              <div className='flex flex-col sm:flex-row sm:items-start py-4'>
                <Label className='text-muted-foreground w-full sm:w-52 flex items-center gap-2 shrink-0 mt-1'>
                  <Building2 className='w-4 h-4' /> Tài khoản ngân hàng
                </Label>
                {bankAccount ? (
                  <div className='flex flex-col gap-0.5'>
                    <p className='font-medium text-base'>
                      {bankAccount.accountNumber} — {bankAccount.bankName}
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      {bankAccount.accountHolder}
                    </p>
                  </div>
                ) : (
                  <p className='font-medium text-base'>---</p>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className='border-t p-6'>
          <DialogClose asChild>
            <Button size={'lg'} variant={'outline'} className='px-4'>
              Đóng
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
