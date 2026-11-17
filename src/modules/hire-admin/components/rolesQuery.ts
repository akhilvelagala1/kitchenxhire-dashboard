import { useQuery } from '@tanstack/react-query';
import { adminRolesApi, type RolesListParams } from '../api/adminCategoriesApi';
import { adminRolesKeys } from '../api/adminCategoriesKeys';

/** There are only a handful of roles, so one request fetches them all and nothing pages. */
const ALL_ROLES: RolesListParams = { page: 1, page_size: 50 };

/** Every role. The panel and the permissions tab share this query, so one fetch serves both. */
export function useRolesList() {
  return useQuery({
    queryKey: adminRolesKeys.list(ALL_ROLES),
    queryFn: () => adminRolesApi.list(ALL_ROLES)
  });
}
