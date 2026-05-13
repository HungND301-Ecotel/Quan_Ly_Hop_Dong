import { useEffect, useState } from 'react';
import { contractTypeService } from '@/services/contract-type/index';
import { ContractType } from '@/services/contract-type/type';

export function useContractTypes() {
  const [data, setData] = useState<ContractType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    contractTypeService.getContractTypeList()
      .then((res) => setData(res ?? []))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}