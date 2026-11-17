import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { ListQuery } from '@/shared/api/types';
import { useApiMutation } from '@/shared/api/useApiMutation';
import type { CategoryFormValues } from '../schemas/category';
import { categoryApi } from './categoryApi';
import { categoryKeys } from './categoryKeys';

export function useCategoryList(q: ListQuery) {
  return useQuery({
    queryKey: categoryKeys.list(q),
    queryFn: () => categoryApi.list(q),
    // Keep the old page on screen while the next one loads; no flash to skeleton.
    placeholderData: keepPreviousData
  });
}

export function useCategory(id: string | undefined) {
  return useQuery({
    queryKey: categoryKeys.detail(id ?? ''),
    queryFn: () => categoryApi.get(id!),
    enabled: Boolean(id)
  });
}

export function useSaveCategory(existing?: { id: string; version: number }) {
  return useApiMutation({
    mutationFn: (v: CategoryFormValues) =>
      existing ? categoryApi.update(existing.id, existing.version, v) : categoryApi.create(v),
    invalidates: [categoryKeys.all],
    successMessage: existing ? 'Category updated' : 'Category created'
  });
}

export function useArchiveCategory() {
  return useApiMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      categoryApi.softDelete(id, reason),
    invalidates: [categoryKeys.all],
    successMessage: 'Category archived'
  });
}

export function useRestoreCategory() {
  return useApiMutation({
    mutationFn: (id: string) => categoryApi.restore(id),
    invalidates: [categoryKeys.all],
    successMessage: 'Category restored'
  });
}

export function useBulkCategoryAction() {
  return useApiMutation({
    mutationFn: (args: {
      action: Parameters<typeof categoryApi.bulk>[0];
      ids: string[];
      reason?: string;
    }) => categoryApi.bulk(args.action, args.ids, args.reason),
    invalidates: [categoryKeys.all],
    successMessage: (r) => `${r.affected} categories updated`
  });
}
