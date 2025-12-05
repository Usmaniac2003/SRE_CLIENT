'use client';

import { useEffect, useState } from 'react';
import { get } from '../api/http';

export function useFetch<T>(url: string, params?: unknown) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await get<T>(url, params);
      setData(res);
      setError(null);
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [url, JSON.stringify(params)]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}
