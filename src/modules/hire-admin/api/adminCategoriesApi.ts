import { apiClient } from '@/shared/api/apiClient';
import type { Job, ListQuery } from '@/shared/api/types';
import type {
  CategoryInput,
  CategoryStatus,
  HireAdminCategory,
  HireAdminRole,
  HireCategoriesRolesSummary,
  RoleInput,
  RolePermissions,
  RoleStatus
} from '../schemas/adminCategoryRole';

const CATEGORIES = '/hire/admin/categories';
const ROLES = '/hire/admin/roles';

/** Filters use snake_case query keys. `q` searches name and code. */
export interface CategoriesListParams extends ListQuery {
  status?: CategoryStatus;
}

export interface RolesListParams extends ListQuery {
  status?: RoleStatus;
}

export const adminCategoriesApi = {
  summary: () => apiClient.get<HireCategoriesRolesSummary>('/hire/admin/categories-roles/summary'),

  list: (q: CategoriesListParams) => apiClient.list<HireAdminCategory>(CATEGORIES, q),

  get: (categoryId: string) => apiClient.get<HireAdminCategory>(`${CATEGORIES}/${categoryId}`),

  create: (body: CategoryInput) =>
    apiClient.post<HireAdminCategory>(CATEGORIES, body, { idempotencyKey: crypto.randomUUID() }),

  update: (categoryId: string, body: Partial<CategoryInput>) =>
    apiClient.patch<HireAdminCategory>(`${CATEGORIES}/${categoryId}`, body),

  setStatus: (categoryId: string, status: CategoryStatus) =>
    apiClient.patch<HireAdminCategory>(`${CATEGORIES}/${categoryId}`, { status }),

  bulkSetStatus: (categoryIds: string[], status: CategoryStatus) =>
    apiClient.post<{ affected: number }>(`${CATEGORIES}/bulk`, {
      action: 'set_status',
      status,
      category_ids: categoryIds
    }),

  /** Exports the filtered view, or only `categoryIds` when any are given. Paging in `list` is ignored. */
  exportCategories: (list: CategoriesListParams, categoryIds: string[]) =>
    apiClient.post<Job>(`${CATEGORIES}/exports`, { ...list, category_ids: categoryIds })
};

export const adminRolesApi = {
  list: (q: RolesListParams) => apiClient.list<HireAdminRole>(ROLES, q),

  get: (roleId: string) => apiClient.get<HireAdminRole>(`${ROLES}/${roleId}`),

  create: (body: RoleInput) =>
    apiClient.post<HireAdminRole>(ROLES, body, { idempotencyKey: crypto.randomUUID() }),

  update: (roleId: string, body: Partial<RoleInput>) =>
    apiClient.patch<HireAdminRole>(`${ROLES}/${roleId}`, body),

  /** Refused with 403 for a protected role. */
  setStatus: (roleId: string, status: RoleStatus) =>
    apiClient.patch<HireAdminRole>(`${ROLES}/${roleId}`, { status }),

  /** Replaces the whole matrix. Refused with 403 for a protected role. */
  setPermissions: (roleId: string, permissions: RolePermissions) =>
    apiClient.patch<HireAdminRole>(`${ROLES}/${roleId}/permissions`, { permissions }),

  /** Refused with 403 for a protected role and with 409 while people still have the role. */
  remove: (roleId: string) => apiClient.delete(`${ROLES}/${roleId}`)
};
