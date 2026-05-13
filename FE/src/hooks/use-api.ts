import { useCallback, useEffect, useState } from 'react';

export type UseApiProps<Data> = {
  service: () => Promise<Data> | Data;
};

export function useApi<Data>({ service }: UseApiProps<Data>) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Data>();
  const [error, setError] = useState<unknown>();

  const refresh = useCallback(async () => {
    try {
      const data = await service();
      setData(data);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [service]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    loading,
    data,
    error,
    refresh,
  };
}
