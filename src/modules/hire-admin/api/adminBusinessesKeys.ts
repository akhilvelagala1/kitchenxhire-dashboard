import type { BusinessesListParams } from './adminBusinessesApi';

export const adminBusinessesKeys = {
  all: ['hire-admin', 'businesses'] as const,
  summary: () => [...adminBusinessesKeys.all, 'summary'] as const,
  locations: () => [...adminBusinessesKeys.all, 'locations'] as const,
  lists: () => [...adminBusinessesKeys.all, 'list'] as const,
  list: (q: BusinessesListParams) => [...adminBusinessesKeys.lists(), q] as const
};
