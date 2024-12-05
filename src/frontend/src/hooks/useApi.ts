import { useState, useCallback } from 'react';
import { ErrorResponse } from '../services/api/types';

type ApiFunction<TParams extends unknown[], TResponse> = (...args: TParams) => Promise<TResponse>;

interface UseApiResponse<TParams extends unknown[], TResponse> {
  data: TResponse | null;
  loading: boolean;
  error: ErrorResponse | null;
  execute: (...args: TParams) => Promise<void>;
}

export function useApi<TParams extends unknown[], TResponse>(
  apiFunction: ApiFunction<TParams, TResponse>
): UseApiResponse<TParams, TResponse> {
  const [data, setData] = useState<TResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ErrorResponse | null>(null);

  const execute = useCallback(
    async (...args: TParams) => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiFunction(...args);
        setData(result);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError({
          message: err.message || 'An error occurred',
          status: err.response?.status || 500,
          code: err.code,
        });
      } finally {
        setLoading(false);
      }
    },
    [apiFunction]
  );

  return { data, loading, error, execute };
}