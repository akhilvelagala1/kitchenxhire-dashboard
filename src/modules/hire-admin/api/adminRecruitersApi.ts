import { apiClient } from '@/shared/api/apiClient';
import type { Job, ListQuery } from '@/shared/api/types';
import type { FilterOption, JoinedPreset, TrendRange } from '../schemas/listDashboard';
import type {
  BusinessType,
  HireAdminRecruiter,
  HireRecruitersSummary,
  RecruiterInput,
  RecruiterStatus,
  RecruiterTab,
  RecruiterVerification
} from '../schemas/adminRecruiter';
import type { TrendPoint } from '../components/trendChartStyle';

const BASE = '/hire/admin/recruiters';

/** Filters use snake_case query keys. `joined` is relative to today; leave it out for any time. */
export interface RecruitersListParams extends ListQuery {
  tab?: RecruiterTab;
  status?: RecruiterStatus;
  business_type?: BusinessType;
  verification?: RecruiterVerification;
  city?: string;
  joined?: Exclude<JoinedPreset, 'all'>;
}

export const adminRecruitersApi = {
  summary: () => apiClient.get<HireRecruitersSummary>(`${BASE}/summary`),

  trend: (range: TrendRange) => apiClient.get<TrendPoint[]>(`${BASE}/trend`, { range }),

  /** The cities recruiters are in, for the Locations filter. */
  locations: () => apiClient.get<FilterOption[]>(`${BASE}/locations`),

  list: (q: RecruitersListParams) => apiClient.list<HireAdminRecruiter>(BASE, q),

  get: (recruiterId: string) => apiClient.get<HireAdminRecruiter>(`${BASE}/${recruiterId}`),

  create: (body: RecruiterInput) =>
    apiClient.post<HireAdminRecruiter>(BASE, body, { idempotencyKey: crypto.randomUUID() }),

  update: (recruiterId: string, body: Partial<RecruiterInput>) =>
    apiClient.patch<HireAdminRecruiter>(`${BASE}/${recruiterId}`, body),

  setStatus: (recruiterId: string, status: RecruiterStatus) =>
    apiClient.patch<HireAdminRecruiter>(`${BASE}/${recruiterId}`, { status }),

  bulkSetStatus: (recruiterIds: string[], status: RecruiterStatus) =>
    apiClient.post<{ affected: number }>(`${BASE}/bulk`, {
      action: 'set_status',
      status,
      recruiter_ids: recruiterIds
    }),

  /** Exports the filtered view, or only `recruiterIds` when any are given. Paging in `list` is ignored. */
  exportRecruiters: (list: RecruitersListParams, recruiterIds: string[]) =>
    apiClient.post<Job>(`${BASE}/exports`, { ...list, recruiter_ids: recruiterIds })
};
