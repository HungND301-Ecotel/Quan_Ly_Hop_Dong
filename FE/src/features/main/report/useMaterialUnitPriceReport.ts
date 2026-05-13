import { useCallback, useEffect, useState } from 'react';
import { contractPaymentService } from '@/services/contract-payment';
import {
  MaterialUnitPriceReportQuery,
  MaterialUnitPriceReportYear,
} from '@/services/contract-payment/type';

interface UseMaterialUnitPriceReportOptions extends MaterialUnitPriceReportQuery {
  enabled?: boolean;
}

export function useMaterialUnitPriceReport(
  options: UseMaterialUnitPriceReportOptions = {}
) {
  const [data, setData] = useState<MaterialUnitPriceReportYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchReport = useCallback(async () => {
    if (options.enabled === false) {
      setLoading(false);
      setData([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await contractPaymentService.getMaterialUnitPriceReports({
        startDateFrom: options.startDateFrom,
        startDateTo: options.startDateTo,
      });
      setData(result ?? []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [options.enabled, options.startDateFrom, options.startDateTo]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  return { data, loading, error, refetch: fetchReport };
}
