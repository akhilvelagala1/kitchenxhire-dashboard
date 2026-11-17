import type { JobSeekersListParams } from './adminJobSeekersApi';

export const adminJobSeekersKeys = {
  all: ['hire-admin', 'job-seekers'] as const,
  summary: () => [...adminJobSeekersKeys.all, 'summary'] as const,
  locations: () => [...adminJobSeekersKeys.all, 'locations'] as const,
  lists: () => [...adminJobSeekersKeys.all, 'list'] as const,
  list: (q: JobSeekersListParams) => [...adminJobSeekersKeys.lists(), q] as const,
  detail: (id: string) => [...adminJobSeekersKeys.all, 'detail', id] as const,
  /** The shared activity list (AuditTrail) keeps its own keys; a write must refresh them too. */
  audit: ['audit-events', 'hire_job_seeker'] as const
};
