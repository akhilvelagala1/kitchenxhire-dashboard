import type { CategoriesListParams, RolesListParams } from './adminCategoriesApi';

export const adminCategoriesKeys = {
  all: ['hire-admin', 'categories'] as const,
  summary: () => [...adminCategoriesKeys.all, 'summary'] as const,
  lists: () => [...adminCategoriesKeys.all, 'list'] as const,
  list: (q: CategoriesListParams) => [...adminCategoriesKeys.lists(), q] as const
};

export const adminRolesKeys = {
  all: ['hire-admin', 'roles'] as const,
  lists: () => [...adminRolesKeys.all, 'list'] as const,
  list: (q: RolesListParams) => [...adminRolesKeys.lists(), q] as const,
  detail: (roleId: string) => [...adminRolesKeys.all, 'detail', roleId] as const
};
