import { useEffect, useState } from 'react';
import { contractStructureCatalogService } from '@/services/structure/index';
import { ContractStructureCatalog } from '@/services/structure/type';

export function useContractStructureCatalogs() {
  const [data, setData] = useState<ContractStructureCatalog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    contractStructureCatalogService.getContractStructureCatalogList()
      .then((res) => setData(res ?? []))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}