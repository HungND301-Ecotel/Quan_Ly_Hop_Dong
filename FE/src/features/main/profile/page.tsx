import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from '@/components/ui/item';
import { SignatureType } from '@/constants/signature-type';
import { useAuthContext } from '@/features/context';
import {
  BadgeCheck,
  Briefcase,
  Building2,
  Mail,
  PenLine,
  Phone,
  Plus,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react';
import { useState } from 'react';
import { SignatureForm } from './components/signature-form';

export function ProfilePage() {
  const { user, refreshUser } = useAuthContext();
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<{
    id: number;
    name: string;
  } | null>(null);

  if (!user) return null;

  return (
    <div className='space-y-6'>
      {/* Header with avatar and name */}
      <Card>
        <CardContent className='pt-6'>
          <div className='flex items-start gap-4'>
            <div className='size-20 rounded-full bg-primary/10 flex items-center justify-center text-primary border-4 border-background shadow-lg shrink-0'>
              <UserIcon className='size-10' />
            </div>
            <div className='flex-1 space-y-3'>
              <div>
                <h1 className='text-2xl font-bold'>{user.fullname}</h1>
                <p className='text-sm text-muted-foreground'>
                  @{user.userName}
                </p>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
                {/* <div className='flex items-center gap-2 text-sm'>
                  <div className='size-8 rounded-lg bg-muted flex items-center justify-center shrink-0'>
                    <UserIcon className='size-4 text-muted-foreground' />
                  </div>
                  <div className='flex flex-col min-w-0'>
                    <span className='text-[10px] text-muted-foreground font-bold uppercase'>
                      Mã nhân viên
                    </span>
                    <span className='font-medium truncate'>{user.id}</span>
                  </div>
                </div> */}
                <div className='flex items-center gap-2 text-sm'>
                  <div className='size-8 rounded-lg bg-muted flex items-center justify-center shrink-0'>
                    <Mail className='size-4 text-muted-foreground' />
                  </div>
                  <div className='flex flex-col min-w-0'>
                    <span className='text-[10px] text-muted-foreground font-bold uppercase'>
                      Email
                    </span>
                    <span className='font-medium truncate'>{user.email}</span>
                  </div>
                </div>
                <div className='flex items-center gap-2 text-sm'>
                  <div className='size-8 rounded-lg bg-muted flex items-center justify-center shrink-0'>
                    <Phone className='size-4 text-muted-foreground' />
                  </div>
                  <div className='flex flex-col min-w-0'>
                    <span className='text-[10px] text-muted-foreground font-bold uppercase'>
                      Số điện thoại
                    </span>
                    <span className='font-medium truncate'>
                      {user.phoneNumber || 'Chưa cập nhật'}
                    </span>
                  </div>
                </div>
                <div className='flex items-center gap-2 text-sm'>
                  <div className='size-8 rounded-lg bg-muted flex items-center justify-center shrink-0'>
                    <Building2 className='size-4 text-muted-foreground' />
                  </div>
                  <div className='flex flex-col min-w-0'>
                    <span className='text-[10px] text-muted-foreground font-bold uppercase'>
                      Phòng ban
                    </span>
                    <span className='font-medium truncate'>
                      {user.departmentName}
                    </span>
                  </div>
                </div>
                <div className='flex items-center gap-2 text-sm'>
                  <div className='size-8 rounded-lg bg-muted flex items-center justify-center shrink-0'>
                    <Briefcase className='size-4 text-muted-foreground' />
                  </div>
                  <div className='flex flex-col min-w-0'>
                    <span className='text-[10px] text-muted-foreground font-bold uppercase'>
                      Chức danh
                    </span>
                    <span className='font-medium truncate'>
                      {user.positionName || 'N/A'}
                    </span>
                  </div>
                </div>
                <div className='flex items-center gap-2 text-sm'>
                  <div className='size-8 rounded-lg bg-muted flex items-center justify-center shrink-0'>
                    <ShieldCheck className='size-4 text-muted-foreground' />
                  </div>
                  <div className='flex flex-col min-w-0'>
                    <span className='text-[10px] text-muted-foreground font-bold uppercase'>
                      Vai trò
                    </span>
                    <span className='font-medium truncate'>{user.role}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signatures section */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <CardTitle className='text-lg flex items-center gap-2'>
            <BadgeCheck className='size-5 text-primary' />
            Chữ ký của tôi
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          {Object.entries(SignatureType).map(([key, name]) => {
            const signature = user.signatures?.find(
              (s) => s.signatureType === Number(key)
            );

            return (
              <Item
                key={key}
                variant='outline'
                className='hover:bg-accent/5 transition-colors'
              >
                <ItemContent>
                  <div className='flex items-center justify-between gap-4'>
                    <div className='space-y-0.5'>
                      <ItemTitle className='text-sm font-bold'>
                        {name}
                      </ItemTitle>
                      <ItemDescription className='text-xs'>
                        {signature
                          ? 'Đã được thiết lập'
                          : 'Chưa được thiết lập'}
                      </ItemDescription>
                    </div>
                    <div className='flex items-center gap-2'>
                      {signature?.isDefault && (
                        <span className='px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase mr-2'>
                          Mặc định
                        </span>
                      )}
                      {signature ? (
                        <Button
                          variant='outline'
                          size='sm'
                          className='h-8'
                          onClick={() => {
                            setSelectedType({ id: Number(key), name });
                            setOpen(true);
                          }}
                        >
                          <PenLine className='size-3.5 mr-1.5' />
                          Sửa
                        </Button>
                      ) : (
                        <Button
                          variant='outline'
                          size='sm'
                          className='h-8'
                          onClick={() => {
                            setSelectedType({ id: Number(key), name });
                            setOpen(true);
                          }}
                        >
                          <Plus className='size-3.5 mr-1.5' />
                          Tạo
                        </Button>
                      )}
                    </div>
                  </div>
                </ItemContent>
              </Item>
            );
          })}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cập nhật {selectedType?.name}</DialogTitle>
            <DialogDescription>
              Hãy tải lên tệp ảnh chữ ký của bạn để sử dụng trong quy trình ký
              hợp đồng.
            </DialogDescription>
          </DialogHeader>
          {selectedType && (
            <SignatureForm
              userId={user.id}
              signatureType={selectedType}
              existingSignature={
                user.signatures?.find(
                  (s) => s.signatureType === selectedType.id
                ) || null
              }
              onSuccess={async () => {
                await refreshUser(); // fetch lại user mới
                setOpen(false);
              }}
              onCancel={() => setOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
