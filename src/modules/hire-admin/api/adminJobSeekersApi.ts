import { apiClient } from '@/shared/api/apiClient';
import type { Job, ListQuery } from '@/shared/api/types';
import type { FilterOption, JoinedPreset } from '../schemas/listDashboard';
import type {
  ExperienceBand,
  HireAdminJobSeeker,
  HireJobSeekersSummary,
  JobSeekerInput,
  JobSeekerStatus,
  JobSeekerTab
} from '../schemas/adminJobSeeker';

const BASE = '/hire/admin/job-seekers';

/** Filters use snake_case query keys. `joined` is relative to today; leave it out for any time. */
export interface JobSeekersListParams extends ListQuery {
  tab?: JobSeekerTab;
  status?: JobSeekerStatus;
  experience?: ExperienceBand;
  city?: string;
  joined?: Exclude<JoinedPreset, 'all'>;
}

export const adminJobSeekersApi = {
  summary: () => apiClient.get<HireJobSeekersSummary>(`${BASE}/summary`),

  /** The cities job seekers are in, for the Locations filter. */
  locations: () => apiClient.get<FilterOption[]>(`${BASE}/locations`),

  list: (q: JobSeekersListParams) => apiClient.list<HireAdminJobSeeker>(BASE, q),

  get: (jobSeekerId: string) => apiClient.get<HireAdminJobSeeker>(`${BASE}/${jobSeekerId}`),

  create: (body: JobSeekerInput) =>
    apiClient.post<HireAdminJobSeeker>(BASE, body, { idempotencyKey: crypto.randomUUID() }),

  update: (jobSeekerId: string, body: Partial<JobSeekerInput>) =>
    apiClient.patch<HireAdminJobSeeker>(`${BASE}/${jobSeekerId}`, body),

  setStatus: (jobSeekerId: string, status: JobSeekerStatus) =>
    apiClient.patch<HireAdminJobSeeker>(`${BASE}/${jobSeekerId}`, { status }),

  bulkSetStatus: (jobSeekerIds: string[], status: JobSeekerStatus) =>
    apiClient.post<{ affected: number }>(`${BASE}/bulk`, {
      action: 'set_status',
      status,
      job_seeker_ids: jobSeekerIds
    }),

  /** Exports the filtered view, or only `jobSeekerIds` when any are given. Paging in `list` is ignored. */
  exportJobSeekers: (list: JobSeekersListParams, jobSeekerIds: string[]) =>
    apiClient.post<Job>(`${BASE}/exports`, { ...list, job_seeker_ids: jobSeekerIds })
};
