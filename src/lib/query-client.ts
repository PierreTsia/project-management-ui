import { QueryClient } from '@tanstack/react-query';

const QUERY_STALE_TIME = 1000 * 60 * 5; // 5 minutes
const QUERY_GC_TIME = 1000 * 60 * 10; // 10 minutes

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: QUERY_STALE_TIME,
      gcTime: QUERY_GC_TIME,
      retry: (failureCount, error) => {
        if (error instanceof Error && 'status' in error) {
          const status = (error as Error & { status?: number }).status;
          if (status && status >= 400 && status < 500) {
            return false;
          }
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});
