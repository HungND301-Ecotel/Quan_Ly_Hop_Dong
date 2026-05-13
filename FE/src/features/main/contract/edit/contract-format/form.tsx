import { Form } from '@/components/form/form';
import { FormSelect } from '@/components/form/form-select';
import { StepperPrev } from '@/components/stepper';
import { useStepperContext } from '@/components/stepper/context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ContractFormat } from '@/constants/contract-format';
import { useContractEditContext } from '@/features/main/contract/edit/context';
import { useApi } from '@/hooks/use-api';
import { cn } from '@/lib/utils';
import { contractService } from '@/services/contract';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, FileText, ShieldCheck } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import {
  ContractFormatDefault,
  ContractFormatSchema,
  ContractFormatValues,
} from './schema';

const formatCards = [
  {
    value: 0,
    icon: FileText,
    color: 'from-blue-500 to-indigo-600',
    selectedColor: 'border-blue-600 ring-4 ring-blue-500/10 bg-blue-50/50',
  },
  {
    value: 1,
    icon: FileText,
    color: 'from-blue-600 to-indigo-700',
    selectedColor: 'border-indigo-700 ring-4 ring-indigo-600/10 bg-indigo-50/50',
  },
  {
    value: 2,
    icon: ShieldCheck,
    color: 'from-emerald-500 to-teal-600',
    selectedColor: 'border-emerald-600 ring-4 ring-emerald-500/10 bg-emerald-50/50',
  },
  {
    value: 3,
    icon: ShieldCheck,
    color: 'from-amber-500 to-orange-600',
    selectedColor: 'border-amber-600 ring-4 ring-amber-500/10 bg-amber-50/50',
  },
];

interface ContractFormatFormProps {
  /** true = luồng lưu trữ (CONTRACT_ARCHIVE_STEPS), false/undefined = luồng phê duyệt (CONTRACT_EDIT_STEPS) */
  isArchive?: boolean;
}

export function ContractFormatForm({ isArchive = false }: ContractFormatFormProps) {
  const { next } = useStepperContext();
  const { contractFormat, setContractFormat, isUpdate, loading, contract } =
    useContractEditContext();

  const isFormatLocked = isUpdate;

  const form = useForm<ContractFormatValues>({
    resolver: zodResolver(ContractFormatSchema),
    defaultValues: contractFormat || ContractFormatDefault,
    mode: 'onSubmit',
  });

  useEffect(() => {
    if (!isUpdate || loading || !contract) return;
    form.reset({
      contractFormat: contract.contractFormat,
      parentContractId: contract.parentContractId || '',
      isDebtTrackingEnabled: contract.isDebtTrackingEnabled,
    });
  }, [isUpdate, loading, contract]);

  const selectedFormat = form.watch('contractFormat');
  const isEconomic = [2, 3].includes(Number(selectedFormat));

  // Hợp đồng phê duyệt (không phải lưu trữ) + kinh tế mua/bán → bắt buộc theo dõi công nợ
  const isDebtTrackingLocked = isEconomic && !isArchive;

  useEffect(() => {
    if (isUpdate) return; // không ghi đè khi đang load dữ liệu update

    if (!isEconomic) {
      // Format 0,1: approval → true, archive → false
      form.setValue('isDebtTrackingEnabled', !isArchive);
    } else if (isDebtTrackingLocked) {
      // Format 2,3 + approval → bắt buộc true
      form.setValue('isDebtTrackingEnabled', true);
    } else {
      // Format 2,3 + archive → mặc định false, user tự chọn
      form.setValue('isDebtTrackingEnabled', false);
    }
  }, [isEconomic, isDebtTrackingLocked, isArchive, isUpdate]);

  const { data: contracts } = useApi({
    service: contractService.getMyVisibleContractList,
  });

  const contractOptions = useMemo(() => {
    return (contracts || [])
      .filter((c) => [0, 1].includes(c.contractFormat))
      .map((contract) => ({
        value: contract.id,
        label: `${contract.contractNumber} - ${contract.title}`,
      }));
  }, [contracts]);

  const handleSubmit = (values: ContractFormatValues) => {
    setContractFormat(values);
    next();
  };

  return (
    <>
      <Form context={form} onSubmit={handleSubmit}>
        <div className='flex flex-col gap-4 items-center'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-6 w-full'>
            {formatCards.map((card) => {
              const isSelected = Number(selectedFormat) === card.value;
              const formatInfo = ContractFormat[card.value];
              const Icon = card.icon;

              return (
                <Card
                  key={card.value}
                  onClick={() => !isFormatLocked && form.setValue('contractFormat', card.value)}
                  className={cn(
                    'group relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 transition-all duration-300 overflow-hidden shadow-none',
                    isFormatLocked
                      ? 'cursor-not-allowed opacity-60'
                      : 'cursor-pointer',
                    isSelected
                      ? card.selectedColor
                      : !isFormatLocked && 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-xl hover:-translate-y-1'
                  )}
                >
                  <CardContent className='p-0 flex flex-col items-center justify-center h-full w-full'>
                    <div className='absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-slate-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500' />
                    <div
                      className={cn(
                        'mb-6 p-4 rounded-xl bg-linear-to-br shadow-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110',
                        card.color
                      )}
                    >
                      <Icon className='w-8 h-8 text-white' />
                    </div>
                    <div className='text-center z-10'>
                      <h4 className='text-sm font-bold mb-2'>{formatInfo?.name}</h4>
                    </div>
                    {isSelected && (
                      <div className='absolute top-4 right-4 animate-in fade-in zoom-in duration-300'>
                        <CheckCircle2 className='w-6 h-6 text-blue-600 fill-blue-50' />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Cấu hình theo dõi công nợ — chỉ hiện khi chọn kinh tế mua/bán */}
        {isEconomic && (
          <Card className='w-full animate-in slide-in-from-top-4 duration-500'>
            <CardContent>
              <div className='flex flex-col gap-3'>
                <div className='flex items-center gap-2 text-sm font-semibold text-primary'>
                  <ShieldCheck className='w-5 h-5' />
                  <span>Cấu hình theo dõi công nợ</span>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  {[
                    { value: true, label: 'Theo dõi công nợ' },
                    { value: false, label: 'Không theo dõi công nợ' },
                  ].map((option) => {
                    const isSelected = form.watch('isDebtTrackingEnabled') === option.value;
                    // Option "Không theo dõi" bị disable khi là luồng phê duyệt
                    const isDisabled = isDebtTrackingLocked && option.value === false;

                    return (
                      <div
                        key={String(option.value)}
                        onClick={() => {
                          if (!isDisabled && !isFormatLocked) {
                            form.setValue('isDebtTrackingEnabled', option.value);
                          }
                        }}
                        className={cn(
                          'flex items-center justify-between p-4 rounded-xl border-2 transition-all',
                          isDisabled || isFormatLocked
                            ? 'cursor-not-allowed opacity-40'
                            : 'cursor-pointer',
                          isSelected
                            ? 'border-blue-600 bg-blue-50/50 ring-4 ring-blue-500/10'
                            : 'border-slate-100 hover:border-slate-300 bg-white'
                        )}
                      >
                        <span className='text-sm font-medium'>{option.label}</span>
                        {isSelected && <CheckCircle2 className='w-5 h-5 text-blue-600' />}
                      </div>
                    );
                  })}
                </div>

                {/* Ghi chú khi bị lock */}
                {isDebtTrackingLocked && (
                  <p className='text-xs text-muted-foreground'>
                    Hợp đồng kinh tế phê duyệt bắt buộc theo dõi công nợ.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Hợp đồng nguyên tắc liên kết */}
        {isEconomic && (
          <Card className='w-full animate-in slide-in-from-top-4 duration-500'>
            <CardContent>
              <FormSelect
                control={form.control}
                name='linkedContractId'
                label='Hợp đồng nguyên tắc liên kết'
                placeholder='Tìm kiếm và chọn hợp đồng...'
                options={[
                  { label: 'Hợp đồng kinh tế độc lập', value: '' },
                  ...contractOptions,
                ]}
              />
            </CardContent>
          </Card>
        )}

        <div className='fixed bottom-0 start-0 p-6 py-4 shadow bg-background w-full border-t flex items-center justify-between'>
          <StepperPrev>Quay lại</StepperPrev>
          <div className='mx-auto hidden md:block' />
          <Button type='submit' className='min-w-24' size='lg'>
            Tiếp tục
          </Button>
        </div>
      </Form>
    </>
  );
}