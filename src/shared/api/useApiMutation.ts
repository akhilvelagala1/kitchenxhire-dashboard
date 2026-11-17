import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { toast } from '@/shared/ui/toast';
import { toErrorMessage } from './errors';

interface ApiMutationOptions<TVars, TData> {
  mutationFn: (vars: TVars) => Promise<TData>;
  /**
   * Required. Every write names the caches it makes stale (CS-05).
   * Pass [] only when the write truly changes nothing that is cached.
   */
  invalidates: QueryKey[];
  successMessage?: string | ((data: TData) => string);
  onSuccess?: (data: TData, vars: TVars) => void;
}

/**
 * The only way views write to the API. Failures always surface as a toast,
 * so a control can never fail silently (CS-06).
 */
export function useApiMutation<TVars, TData = unknown>(opts: ApiMutationOptions<TVars, TData>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: opts.mutationFn,
    onSuccess: async (data, vars) => {
      await Promise.all(
        opts.invalidates.map((queryKey) => queryClient.invalidateQueries({ queryKey }))
      );
      if (opts.successMessage) {
        const msg =
          typeof opts.successMessage === 'function'
            ? opts.successMessage(data)
            : opts.successMessage;
        toast.success(msg);
      }
      opts.onSuccess?.(data, vars);
    },
    onError: (err) => toast.error(toErrorMessage(err))
  });
}
