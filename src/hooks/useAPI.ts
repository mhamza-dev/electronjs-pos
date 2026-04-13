import { useState, useCallback } from "react";

interface APIState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useAPI<T, Args extends any[]>(
  apiFunc: (...args: Args) => Promise<T>,
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
        const result = await apiFunc(...args);
        setState({ data: result, loading: false, error: null });
        if (options.onSuccess) options.onSuccess(result);
        return result;
      } catch (err: any) {
        const errorMessage = err.message || "Something went wrong";
        setState({ data: null, loading: false, error: errorMessage });
        if (options.onError) options.onError(errorMessage);
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
