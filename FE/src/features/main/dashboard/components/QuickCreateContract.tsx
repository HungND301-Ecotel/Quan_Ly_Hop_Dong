import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogProvider,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { ContractEdit } from '@/features/main/contract/edit';
import { ContractArchiveCreate } from '@/features/main/contract/archive/create';
import { FileSignature, Archive, PlusIcon } from 'lucide-react';
import { useState } from 'react';

export function ContractCreate({ callback, trigger }: any) {
    const [open, setOpen] = useState(false);
    const [openApprovalDialog, setOpenApprovalDialog] = useState(false);
    const [openArchiveDialog, setOpenArchiveDialog] = useState(false);

    const handleSelectType = (type: 'approval' | 'archive') => {
        setOpen(false); // Đóng modal chọn loại

        // Mở modal tương ứng SAU khi modal chọn loại đã đóng
        setTimeout(() => {
            if (type === 'approval') {
                setOpenApprovalDialog(true);
            } else {
                setOpenArchiveDialog(true);
            }
        }, 100); // Delay nhỏ để modal cũ đóng hẳn
    };

    const handleCallback = async () => {
        setOpenApprovalDialog(false);
        setOpenArchiveDialog(false);
        await callback?.();
    };

    return (
        <>
            {/* Dialog chọn loại hợp đồng */}
            <DialogProvider open={open} setOpen={setOpen}>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        {trigger || (
                            <Button variant='default' size={'lg'} className='px-4'>
                                <PlusIcon />
                                <span>Tạo mới</span>
                            </Button>
                        )}
                    </DialogTrigger>
                    <DialogContent className='max-w-2xl'>
                        <DialogHeader>
                            <DialogTitle className='text-2xl'>
                                Chọn loại hợp đồng
                            </DialogTitle>
                            <DialogDescription>
                                Vui lòng chọn loại hợp đồng bạn muốn tạo
                            </DialogDescription>
                        </DialogHeader>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 py-4'>
                            {/* Card: Hợp đồng phê duyệt */}
                            <Card
                                className='hover:shadow-lg cursor-pointer transition-all border-2 hover:border-primary'
                                onClick={() => handleSelectType('approval')}
                            >
                                <CardContent className='flex flex-col items-center justify-center p-6 gap-4'>
                                    <div className='p-4 bg-primary/10 rounded-full'>
                                        <FileSignature className='h-12 w-12 text-primary' />
                                    </div>
                                    <div className='text-center'>
                                        <h3 className='font-semibold text-lg mb-2'>
                                            Hợp đồng phê duyệt
                                        </h3>
                                        <p className='text-sm text-muted-foreground'>
                                            Tạo hợp đồng cần phê duyệt qua các bước
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Card: Hợp đồng lưu trữ */}
                            <Card
                                className='hover:shadow-lg cursor-pointer transition-all border-2 hover:border-blue-500'
                                onClick={() => handleSelectType('archive')}
                            >
                                <CardContent className='flex flex-col items-center justify-center p-6 gap-4'>
                                    <div className='p-4 bg-blue-100 rounded-full'>
                                        <Archive className='h-12 w-12 text-blue-500' />
                                    </div>
                                    <div className='text-center'>
                                        <h3 className='font-semibold text-lg mb-2'>
                                            Hợp đồng lưu trữ
                                        </h3>
                                        <p className='text-sm text-muted-foreground'>
                                            Tạo hợp đồng để lưu trữ trực tiếp
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </DialogContent>
                </Dialog>
            </DialogProvider>

            {/* Dialog tạo hợp đồng phê duyệt */}
            <ContractEdit
                open={openApprovalDialog}
                onOpenChange={setOpenApprovalDialog}
                callback={handleCallback}
            />

            {/* Dialog tạo hợp đồng lưu trữ */}
            <ContractArchiveCreate
                open={openArchiveDialog}
                onOpenChange={setOpenArchiveDialog}
                callback={handleCallback}
            />
        </>
    );
}
