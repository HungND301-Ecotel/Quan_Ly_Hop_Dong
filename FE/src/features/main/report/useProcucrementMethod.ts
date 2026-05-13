// useProcurementMethods.ts
import { useEffect, useState } from 'react';
import { procurementMethodService } from '@/services/procurement-method/index';
import { ProcurementMethod } from '@/services/procurement-method/type';

export function useProcurementMethods() {
  const [data, setData] = useState<ProcurementMethod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    procurementMethodService.getProcurementMethodList()
      .then((res) => setData(res ?? []))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}