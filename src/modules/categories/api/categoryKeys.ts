import type { ListQuery } from '@/shared/api/types';

/** Query-key factory: invalidating `all` refreshes every category list and detail (CS-05). */
export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (q: ListQuery) => [...categoryKeys.lists(), q] as const,
  detail: (id: string) => [...categoryKeys.all, 'detail', id] as const,
  options: () => [...categoryKeys.all, 'options'] as const
};
