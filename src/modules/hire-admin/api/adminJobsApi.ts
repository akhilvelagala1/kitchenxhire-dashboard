import { apiClient } from '@/shared/api/apiClient';
import type { Job, ListQuery } from '@/shared/api/types';
import type { HireAdminJob, HireJobsSummary, JobsDateRangePreset } from '../schemas/adminJob';
import type { JobPostBody } from '../schemas/adminJobPost';

const BASE = '/hire/admin/jobs';

/** List filters use snake_case query keys; pause/close/delete follow softDelete-style lifecycle on the server. */
export interface JobsListParams extends ListQuery {
  job_status?: string;
  job_category?: string;
  location?: string;
  recruiter_name?: string;
  job_title_label?: string;
  recruited?: boolean;
  range?: JobsDateRangePreset;
}

function rangeParams(range: JobsDateRangePreset, from?: string, to?: string) {
  return {
    range,
    ...(from && to ? { from, to } : {})
  };
}

export const adminJobsApi = {
  summary: (range: JobsDateRangePreset, from?: string, to?: string) =>
    apiClient.get<HireJobsSummary>(`${BASE}/summary`, rangeParams(range, from, to)),

  list: (q: JobsListParams) => apiClient.list<HireAdminJob>(BASE, q),

  get: (jobId: string) => apiClient.get<HireAdminJob>(`${BASE}/${jobId}`),

  create: (body: JobPostBody) => apiClient.post<HireAdminJob>(BASE, body),

  patch: (jobId: string, body: Partial<Pick<HireAdminJob, 'title' | 'status'>>) =>
    apiClient.patch<HireAdminJob>(`${BASE}/${jobId}`, body),

  delete: (jobId: string) => apiClient.delete(`${BASE}/${jobId}`),

  bulk: (action: 'approve' | 'pause' | 'close', job_ids: string[]) =>
    apiClient.post<{ affected: number }>(`${BASE}/bulk`, { action, job_ids }),

  exportJobs: (list: JobsListParams, jobIds: string[]) =>
    apiClient.post<Job>(`${BASE}/exports`, { ...list, job_ids: jobIds }),

  importJobs: (file: File, opts: { dryRun: boolean }) =>
    apiClient.upload<Job>(`${BASE}/imports`, file, { dry_run: String(opts.dryRun) })
};
