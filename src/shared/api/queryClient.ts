import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './errors';

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: true,
        // A 4xx will not fix itself on retry.
        retry: (count, err) => !(err instanceof ApiError && err.isClientError) && count < 2
      }
    }
  });
}
