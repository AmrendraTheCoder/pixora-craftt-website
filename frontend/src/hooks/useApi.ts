import { useState, useEffect, useCallback } from 'react';
import { ApiError } from '@/lib/api';

// Generic hook for API calls with loading, error, and data states
export function useApiCall<T>(
  apiFunction: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction();
      setData(result);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

// Hook for API mutations (POST, PUT, DELETE operations)
export function useApiMutation<T, P>(
  apiFunction: (params: P) => Promise<T>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const mutate = useCallback(async (params: P) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction(params);
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 
                          err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    mutate,
    loading,
    error,
    data,
    reset,
  };
}

// Hook for paginated API calls
export function usePaginatedApi<T>(
  apiFunction: (params: { page: number; limit: number; [key: string]: any }) => Promise<{
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>,
  initialParams: { page?: number; limit?: number; [key: string]: any } = {}
) {
  const [data, setData] = useState<T[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState(initialParams);

  const fetchData = useCallback(async (newParams?: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const finalParams = {
        page: 1,
        limit: 20,
        ...params,
        ...newParams,
      };

      const result = await apiFunction(finalParams);
      setData(result.data);
      setPagination(result.pagination);
      setParams(finalParams);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  }, [apiFunction, params]);

  useEffect(() => {
    fetchData();
  }, []);

  const goToPage = useCallback((page: number) => {
    fetchData({ page });
  }, [fetchData]);

  const changeLimit = useCallback((limit: number) => {
    fetchData({ limit, page: 1 });
  }, [fetchData]);

  const updateFilters = useCallback((filters: any) => {
    fetchData({ ...filters, page: 1 });
  }, [fetchData]);

  return {
    data,
    pagination,
    loading,
    error,
    goToPage,
    changeLimit,
    updateFilters,
    refetch: () => fetchData(params),
  };
}

// Hook for real-time polling
export function usePolling<T>(
  apiFunction: () => Promise<T>,
  interval: number = 30000, // 30 seconds default
  enabled: boolean = true
) {
  const { data, loading, error, refetch } = useApiCall(apiFunction);

  useEffect(() => {
    if (!enabled) return;

    const intervalId = setInterval(() => {
      refetch();
    }, interval);

    return () => clearInterval(intervalId);
  }, [refetch, interval, enabled]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}

// Hook for optimistic updates
export function useOptimisticUpdate<T>(
  initialData: T[],
  idField: keyof T = 'id' as keyof T
) {
  const [optimisticData, setOptimisticData] = useState<T[]>(initialData);

  const addOptimistic = useCallback((item: T) => {
    setOptimisticData(prev => [...prev, item]);
  }, []);

  const updateOptimistic = useCallback((id: any, updates: Partial<T>) => {
    setOptimisticData(prev => 
      prev.map(item => 
        item[idField] === id ? { ...item, ...updates } : item
      )
    );
  }, [idField]);

  const removeOptimistic = useCallback((id: any) => {
    setOptimisticData(prev => 
      prev.filter(item => item[idField] !== id)
    );
  }, [idField]);

  const resetOptimistic = useCallback(() => {
    setOptimisticData(initialData);
  }, [initialData]);

  const syncWithServer = useCallback((serverData: T[]) => {
    setOptimisticData(serverData);
  }, []);

  return {
    data: optimisticData,
    addOptimistic,
    updateOptimistic,
    removeOptimistic,
    resetOptimistic,
    syncWithServer,
  };
} 