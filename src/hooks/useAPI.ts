// hooks/useAPI.ts
import { useState, useCallback } from "react";

interface APIState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T, Args extends any[] = any[]>(
  apiFunc: (...args: Args) => Promise<{ data: T | null; error: any }>,
  options: {
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
  } = {},
) {
  const [state, setState] = useState<APIState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const request = useCallback(
    async (...args: Args) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const { data, error: serviceError } = await apiFunc(...args);

        if (serviceError) {
          const message =
            serviceError?.message || "An error occurred while fetching data.";
          setState({ data: null, loading: false, error: message });
          options.onError?.(message);
          throw new Error(message);
        }

        setState({ data, loading: false, error: null });
        options.onSuccess?.(data as T);
        return data;
      } catch (err: any) {
        // If the service itself throws (network, unexpected), handle here
        const message =
          err instanceof Error ? err.message : "Something went wrong";
        setState({ data: null, loading: false, error: message });
        options.onError?.(message);
        throw err;
      }
    },
    [apiFunc, options],
  );

  const setData = useCallback((data: T | null) => {
    setState((prev) => ({ ...prev, data }));
  }, []);

  return {
    ...state,
    request,
    setData,
  };
}
