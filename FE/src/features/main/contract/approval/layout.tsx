import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { contractService } from '@/services/contract';
import { DynamicIcon, IconName } from 'lucide-react/dynamic';
import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const items: { title: string; icon: IconName; url: string; countKey: 'all' | 'pending' | 'history' }[] = [
  {
    title: 'Tất cả hợp đồng',
    icon: 'file-text',
    url: '/contract/approval',
    countKey: 'all',
  },
  {
    title: 'Hợp đồng chờ phê duyệt',
    icon: 'timer',
    url: '/contract/approval/pending',
    countKey: 'pending',
  },
  {
    title: 'Hợp đồng đã phê duyệt',
    icon: 'history',
    url: '/contract/approval/history',
    countKey: 'history',
  },
];

export function ContractApprovalLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const [counts, setCounts] = useState<{ all?: number; pending?: number; history?: number }>({});

  useEffect(() => {
    Promise.allSettled([
      contractService.getMyVisibleContractList({ isArchiveContract: false }),
      contractService.getContractPendingList(),
      contractService.getContractHistoryList(),
    ]).then(([allRes, pendingRes, historyRes]) => {
      setCounts({
        all:     allRes.status     === 'fulfilled' ? (allRes.value?.length     ?? 0) : undefined,
        pending: pendingRes.status === 'fulfilled' ? (pendingRes.value?.length ?? 0) : undefined,
        history: historyRes.status === 'fulfilled' ? (historyRes.value?.length ?? 0) : undefined,
      });
    });
  }, []);

  return (
    <div className='space-y-6'>
      <Tabs defaultValue={location.pathname}>
        <TabsList className='border gap-1 bg-background w-full'>
          {items.map(({ title, icon, url, countKey }) => {
            const count = counts[countKey];
            return (
              <TabsTrigger key={url} value={url} onClick={() => navigate(url)} className='relative'>
                <DynamicIcon name={icon} />
                <span>{title}</span>
                {count !== undefined && (
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
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>
      <Outlet />
    </div>
  );
}