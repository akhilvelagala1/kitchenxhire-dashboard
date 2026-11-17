import { useApiMutation } from '@/shared/api/useApiMutation';
import { toast } from '@/shared/ui/toast';
import { adminCategoriesApi } from '../api/adminCategoriesApi';
import { adminCategoriesKeys } from '../api/adminCategoriesKeys';
import type { CategoryInput, CategoryStatus } from '../schemas/adminCategoryRole';

/** Every write refreshes the lists, the summary card and the audit history. */
const INVALIDATES = [adminCategoriesKeys.all, ['audit-events']];

const STATUS_DONE: Record<CategoryStatus, string> = {
  active: 'Category activated',
  inactive: 'Category deactivated',
  archived: 'Category archived'
};

export function useSetCategoryStatus() {
  return useApiMutation({
    mutationFn: (vars: { categoryId: string; status: CategoryStatus }) =>
      adminCategoriesApi.setStatus(vars.categoryId, vars.status),
    invalidates: INVALIDATES,
    onSuccess: (_data, vars) => toast.success(STATUS_DONE[vars.status])
  });
}

export function useCreateCategory() {
  return useApiMutation({
    mutationFn: (body: CategoryInput) => adminCategoriesApi.create(body),
    invalidates: INVALIDATES,
    successMessage: 'Category added'
  });
}

export function useUpdateCategory(categoryId: string) {
  return useApiMutation({
    mutationFn: (body: Partial<CategoryInput>) => adminCategoriesApi.update(categoryId, body),
    invalidates: INVALIDATES,
    successMessage: 'Category saved'
  });
}

export function useBulkSetCategoryStatus() {
  return useApiMutation({
    mutationFn: (vars: { categoryIds: string[]; status: CategoryStatus }) =>
      adminCategoriesApi.bulkSetStatus(vars.categoryIds, vars.status),
    invalidates: INVALIDATES,
    successMessage: ({ affected }) =>
      `${affected} ${affected === 1 ? 'category' : 'categories'} updated`
  });
}
