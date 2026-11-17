import type { ListQuery } from '@/shared/api/types';
import type { JobsDateRangePreset } from '../schemas/adminJob';

export const adminJobsKeys = {
  all: ['hire-admin', 'jobs'] as const,
  summary: (range: JobsDateRangePreset, from?: string, to?: string) =>
    [...adminJobsKeys.all, 'summary', range, from, to] as const,
  lists: () => [...adminJobsKeys.all, 'list'] as const,
  list: (q: ListQuery & { jobs_status?: string; jobs_category?: string }) =>
    [...adminJobsKeys.lists(), q] as const,
  detail: (id: string) => [...adminJobsKeys.all, 'detail', id] as const
};
