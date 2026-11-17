import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/apiClient';
import { sessionKeys } from './sessionKeys';

interface Me {
  user_id: string;
  role: string;
  permissions: string[];
}

/**
 * Permissions live in react-query, not a persisted store, so an RBAC edit that
 * invalidates sessionKeys.me updates every gate without a reload (CS-05).
 * The server still authorizes every call (G-02); this only hides controls.
 */
export function usePermissions() {
  const query = useQuery({
    queryKey: sessionKeys.me,
    queryFn: () => apiClient.get<Me>('/auth/me'),
    staleTime: 60_000
  });
  const granted = new Set(query.data?.permissions ?? []);
  return {
    isLoading: query.isLoading,
    can: (permission: string) => granted.has(permission) || granted.has('*')
  };
}
