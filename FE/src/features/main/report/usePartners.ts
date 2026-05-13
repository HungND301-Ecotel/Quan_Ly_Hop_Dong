import { useEffect, useState } from 'react';
import { partnerService } from '@/services/partner/index';
import { Partner } from '@/services/partner/type';

export function usePartners() {
  const [data, setData] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    partnerService.getPartnerList()
      .then((res) => setData(res ?? []))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}