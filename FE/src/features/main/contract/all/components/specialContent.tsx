import { DynamicTitle } from '@/components/dynamic-title';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { contractService } from '@/services/contract';
import { DynamicIcon } from 'lucide-react/dynamic';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ContractCreate } from '../../../dashboard/components/QuickCreateContract';

function TabBadge({ count }: { count: number }) {
  return (
    <span
      className='
      absolute -top-1.5 -right-1.5
      min-w-4.5 h-4.5 px-1
      rounded-full bg-red-500
      text-[10px] font-bold text-white
      flex items-center justify-center
      leading-none pointer-events-none
    '
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}

export function SpecialContent() {
  const navigate = useNavigate();
  const location = useLocation();

  const [counts, setCounts] = useState<{
    all?: number;
    expired?: number;
    paymentDue?: number;
  }>({});

  useEffect(() => {
    Promise.allSettled([
      contractService.getMyVisibleContractList(),
      contractService.getContractSoonExpired(),
      contractService.getContractPaymentDueSoon(),
    ]).then(([allRes, expiredRes, paymentRes]) => {
      setCounts({
        all:
          allRes.status === 'fulfilled'
            ? (allRes.value?.length ?? 0)
            : undefined,
        expired:
          expiredRes.status === 'fulfilled'
            ? (expiredRes.value?.length ?? 0)
            : undefined,
        paymentDue:
          paymentRes.status === 'fulfilled'
            ? (paymentRes.value?.length ?? 0)
            : undefined,
      });
    });
  }, []);

  const getCurrentTab = () => {
    if (location.pathname === '/contract/all') return 'all';
    if (location.pathname === '/contract/expired') return 'expired';
    if (location.pathname === '/contract/payment-due') return 'payment-due';
    return 'all';
  };

  const handleTabChange = (value: string) => {
    switch (value) {
      case 'all':
        navigate('/contract/all');
        break;
      case 'expired':
        navigate('/contract/expired');
        break;
      case 'payment-due':
        navigate('/contract/payment-due');
        break;
    }
  };

  const currentTab = getCurrentTab();

  return (
    <div className='space-y-4'>
      {/* Hàng 1: Title + Button tạo mới */}
      <div className='flex items-center justify-between'>
        <DynamicTitle />
        {currentTab === 'all' && (
          <ContractCreate
            trigger={
              <Button className='bg-blue-500 hover:bg-blue-600 text-white'>
                <DynamicIcon name='plus' />
                Tạo mới hợp đồng
              </Button>
            }
          />
        )}
      </div>

      {/* Hàng 2: Tabs full width */}
      <Tabs value={currentTab} onValueChange={handleTabChange}>
        <TabsList className='border gap-1 bg-background w-full'>
          <TabsTrigger value='all' className='relative'>
            <span>Tất cả hợp đồng</span>
            {counts.all !== undefined && <TabBadge count={counts.all} />}
          </TabsTrigger>
          <TabsTrigger value='expired' className='relative'>
            <span>Hợp đồng sắp hết hạn</span>
            {counts.expired !== undefined && (
              <TabBadge count={counts.expired} />
            )}
          </TabsTrigger>
          <TabsTrigger value='payment-due' className='relative'>
            <span>Hợp đồng đến hạn thanh toán</span>
            {counts.paymentDue !== undefined && (
              <TabBadge count={counts.paymentDue} />
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
