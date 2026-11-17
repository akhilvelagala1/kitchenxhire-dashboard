import { apiClient } from '@/shared/api/apiClient';
import type { Job, ListQuery } from '@/shared/api/types';
import type {
  ApplicationOption,
  ApplicationOptionKind,
  ApplicationTab,
  HireAdminApplication,
  HireApplicationStatus,
  HireApplicationsSummary,
  ScheduleInterviewBody
} from '../schemas/adminApplication';

const BASE = '/hire/admin/applications';

/** List filters use snake_case query keys. `from` and `to` filter on the applied date. */
export interface ApplicationsListParams extends ListQuery {
  tab?: ApplicationTab;
  status?: HireApplicationStatus;
  job_id?: string;
  recruiter_id?: string;
  location?: string;
}

export const adminApplicationsApi = {
  summary: () => apiClient.get<HireApplicationsSummary>(`${BASE}/summary`),

  /** Server-side search for the Job, Recruiter and Location filters; at most about 20 options. */
  options: (kind: ApplicationOptionKind, search?: string) =>
    apiClient.get<ApplicationOption[]>(`${BASE}/options/${kind}`, { search }),

  list: (q: ApplicationsListParams) => apiClient.list<HireAdminApplication>(BASE, q),

  get: (applicationId: string) => apiClient.get<HireAdminApplication>(`${BASE}/${applicationId}`),

  setStatus: (applicationId: string, status: HireApplicationStatus) =>
    apiClient.patch<HireAdminApplication>(`${BASE}/${applicationId}`, { status }),

  scheduleInterview: (applicationId: string, body: ScheduleInterviewBody) =>
    apiClient.post<HireAdminApplication>(`${BASE}/${applicationId}/interview`, body),

  bulkSetStatus: (applicationIds: string[], status: HireApplicationStatus) =>
    apiClient.post<{ affected: number }>(`${BASE}/bulk`, {
      action: 'set_status',
      status,
      application_ids: applicationIds
    }),

  /** Exports the filtered view, or only `applicationIds` when any are given. */
  exportApplications: (list: ApplicationsListParams, applicationIds: string[]) =>
    apiClient.post<Job>(`${BASE}/exports`, { ...list, application_ids: applicationIds })
};
