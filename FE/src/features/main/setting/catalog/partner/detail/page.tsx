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
import { partnerService } from '@/services/partner';
import { Partner } from '@/services/partner/type';
import {
  Building2,
  EyeIcon,
  Hash,
  Mail,
  MapPin,
  Phone,
  User,
} from 'lucide-react';
import { useCallback, useState } from 'react';

export function PartnerDetail({ row }: DataTableEvent<Partner>) {
  const [open, setOpen] = useState(false);

  const detailService = useCallback(() => {
    if (!row || !open) return;
    return partnerService.getPartnerDetail(row.original.id);
  }, [row, open]);

  const detail = useApi({ service: detailService });
  if (!row) return null;

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
              {/* Tên đối tác */}
              <div className='flex flex-col sm:flex-row sm:items-center py-4'>
                <Label className='text-muted-foreground w-full sm:w-52 flex items-center gap-2 shrink-0'>
                  <Building2 className='w-4 h-4' /> Tên đối tác
                </Label>
                <p className='font-medium text-base'>
                  {detail.data?.name || '---'}
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

              {/* Địa chỉ */}
              <div className='flex flex-col sm:flex-row sm:items-start py-4'>
                <Label className='text-muted-foreground w-full sm:w-52 flex items-center gap-2 shrink-0 mt-1'>
                  <MapPin className='w-4 h-4' /> Địa chỉ
                </Label>
                <p className='font-medium text-base'>
                  {detail.data?.address || '---'}
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

              {/* Số điện thoại */}
              <div className='flex flex-col sm:flex-row sm:items-center py-4'>
                <Label className='text-muted-foreground w-full sm:w-52 flex items-center gap-2 shrink-0'>
                  <Phone className='w-4 h-4' /> Số điện thoại
                </Label>
                <p className='font-medium text-base'>
                  {detail.data?.phone || '---'}
                </p>
              </div>

              {/* Email */}
              <div className='flex flex-col sm:flex-row sm:items-center py-4'>
                <Label className='text-muted-foreground w-full sm:w-52 flex items-center gap-2 shrink-0'>
                  <Mail className='w-4 h-4' /> Email liên hệ
                </Label>
                <p className='font-medium text-base'>
                  {detail.data?.email || '---'}
                </p>
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
