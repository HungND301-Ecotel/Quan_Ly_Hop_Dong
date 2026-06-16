import { Stepper, StepperProvider } from '@/components/stepper';
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
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { ContractFormat } from '@/constants/contract-format';
import { useContractEditContext } from '@/features/main/contract/edit/context';
import { ContractEditProvider } from '@/features/main/contract/edit/provider';
import { Contract } from '@/services/contract/type';
import { Clock } from 'lucide-react';
import { useState } from 'react';
import {
    CONTRACT_RENEW_ARCHIVE_STEPS,
    CONTRACT_RENEW_STEPS,
} from './stepRenew';
import { contractService } from '@/services/contract';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';

interface ContractRenewProps {
    contract: Contract;
    callback?: () => void;
}

export function ContractRenew({ contract, callback }: ContractRenewProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [detail, setDetail] = useState<Contract | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    const handleOpen = async () => {
        try {
            setLoadingDetail(true);
            const res = await contractService.getContractDetail(contract.id);
            setDetail(res ?? null);
            setInternalOpen(true);
        } catch {
            toast.error('Không thể tải thông tin hợp đồng');
        } finally {
            setLoadingDetail(false);
        }
    };

    const handleSuccess = () => {
        setInternalOpen(false);
        setDetail(null);
        callback?.();
    };

    const steps = contract.isArchiveContract
        ? CONTRACT_RENEW_ARCHIVE_STEPS
        : CONTRACT_RENEW_STEPS;

    // Dùng detail nếu đã fetch, fallback về contract từ list
    const contractData = detail ?? contract;

    return (
        <DialogProvider open={internalOpen} setOpen={setInternalOpen}>
            <Dialog open={internalOpen} onOpenChange={setInternalOpen}>
                <DialogTrigger asChild>
                    <Button
                        variant='outline'
                        size='sm'
                        className='h-8 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700'
                        title='Gia hạn hợp đồng'
                        onClick={handleOpen}
                        disabled={loadingDetail}
                    >
                        {loadingDetail
                            ? <Spinner className='size-3.5' />
                            : <Clock className='size-3.5' />
                        }
                    </Button>
                </DialogTrigger>

                {/* Chỉ render nội dung dialog khi đã có detail */}
                {detail && (
                    <DialogContent className='h-[calc(100vh-4rem)] min-w-[calc(100vw-4rem)] bg-muted p-0 overflow-hidden gap-0 pb-18'>
                        <StepperProvider steps={steps}>
                            <ContractEditProvider
                                defaultFormat={contractData.contractFormat}
                                defaultIsDebtTracking={contractData.isDebtTrackingEnabled}
                                defaultParentContractId={contractData.id}
                                defaultBasicInformation={{
                                    contractTypeId: contractData.contractTypeId ?? '',
                                    contractRegisterId: contractData.contractRegisterId ?? '',
                                    procurementMethodId: contractData.procurementMethodId ?? '',
                                    departmentId: contractData.departmentId ?? '',
                                    partnerId: contractData.partnerId ?? '',
                                    title: contractData.title ?? '',
                                    contractStructureId: contractData.contractStructureId ?? '',
                                    level1CodeId: contractData.level1CodeId ?? '',
                                    level2CodeId: contractData.level2CodeId ?? '',
                                    level3CodeId: contractData.level3CodeId ?? '',
                                    notes: contractData.notes ?? '',
                                    contractValue: contractData.contractValue ?? 0,
                                    discountType: contractData.discountType ?? 0,
                                    discountValue: contractData.discountValue ?? 0,
                                    // Map contractItems từ detail
                                    contractItems: contractData.contractItems?.map((item) => ({
                                        materialId: item.materialId,
                                        quantity: item.quantity,
                                    })) ?? [],
                                    // Map contractOtherItems từ detail
                                    contractOtherItems: contractData.contractOtherItems?.map((item) => ({
                                        materialId: item.materialId,
                                        quantity: item.quantity,
                                    })) ?? [],
                                    // Map contractUserRoles từ detail
                                    contractUserRoles: {
                                        draftingOfficer: {
                                            userId: contractData.contractUserRoles?.find((r) => r.role === 0)?.userId ?? '',
                                            departmentId: contractData.contractUserRoles?.find((r) => r.role === 0)?.departmentId ?? '', // ← thêm
                                        },
                                        manager: {
                                            userId: contractData.contractUserRoles?.find((r) => r.role === 1)?.userId ?? '',
                                            departmentId: contractData.contractUserRoles?.find((r) => r.role === 1)?.departmentId ?? '',
                                        },
                                        coordinator: {
                                            userId: contractData.contractUserRoles?.find((r) => r.role === 2)?.userId ?? '',
                                            departmentId: contractData.contractUserRoles?.find((r) => r.role === 2)?.departmentId ?? '',
                                        },
                                        receivingOfficer: {
                                            userId: contractData.contractUserRoles?.find((r) => r.role === 3)?.userId ?? '',
                                            departmentId: contractData.contractUserRoles?.find((r) => r.role === 3)?.departmentId ?? '',
                                        },
                                    },
                                }}
                                callback={handleSuccess}
                            >
                                <DialogHeader className='border-b h-fit p-6 bg-background'>
                                    <DialogTitle className='text-xl'>
                                        Gia hạn <ContractRenewSubTitle contract={contract} />
                                    </DialogTitle>
                                    <DialogDescription>
                                        Gia hạn hợp đồng mới từ liên kết với{' '}
                                        <span className='font-semibold text-foreground'>
                                            {contract.contractNumber}
                                        </span>
                                    </DialogDescription>
                                </DialogHeader>

                                <ScrollArea className='flex-1 overflow-hidden bg-muted'>
                                    <div className='flex flex-col h-full flex-1 p-6'>
                                        <Stepper className='flex-1 h-full' />
                                    </div>
                                    <ScrollBar orientation='vertical' />
                                    <ScrollBar orientation='horizontal' />
                                </ScrollArea>
                            </ContractEditProvider>
                        </StepperProvider>
                    </DialogContent>
                )}
            </Dialog>
        </DialogProvider>
    );
}

function ContractRenewSubTitle({ contract }: { contract: Contract }) {
    const { contractFormat } = useContractEditContext();

    // Ưu tiên format đã chọn trong stepper, fallback về format HĐ gốc
    const currentFormat =
        contractFormat?.contractFormat ?? contract.contractFormat;

    if (currentFormat !== undefined && currentFormat !== null) {
        return ContractFormat[currentFormat]?.name?.toLocaleLowerCase() ?? 'hợp đồng';
    }

    return 'hợp đồng';
}