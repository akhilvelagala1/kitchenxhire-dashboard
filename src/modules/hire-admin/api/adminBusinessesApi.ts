import { apiClient } from '@/shared/api/apiClient';
import type { Job, ListQuery } from '@/shared/api/types';
import type {
  BusinessInput,
  BusinessKind,
  BusinessSettableStatus,
  BusinessStatus,
  BusinessTab,
  BusinessVerification,
  HireAdminBusiness,
  HireBusinessesSummary
} from '../schemas/adminBusiness';
import type { FilterOption, JoinedPreset } from '../schemas/listDashboard';

const BASE = '/hire/admin/businesses';

/** Filters use snake_case query keys. `joined` limits to businesses that joined in that window. */
export interface BusinessesListParams extends ListQuery {
  tab?: BusinessTab;
  status?: BusinessStatus;
  business_type?: BusinessKind;
  verification?: BusinessVerification;
  city?: string;
  joined?: Exclude<JoinedPreset, 'all'>;
}

export const adminBusinessesApi = {
  summary: () => apiClient.get<HireBusinessesSummary>(`${BASE}/summary`),

  /** The cities businesses are in, for the Locations filter. */
  locations: () => apiClient.get<FilterOption[]>(`${BASE}/locations`),

  list: (q: BusinessesListParams) => apiClient.list<HireAdminBusiness>(BASE, q),

  create: (body: BusinessInput) =>
    apiClient.post<HireAdminBusiness>(BASE, body, { idempotencyKey: crypto.randomUUID() }),

  update: (businessId: string, body: Partial<BusinessInput>) =>
    apiClient.patch<HireAdminBusiness>(`${BASE}/${businessId}`, body),

  setStatus: (businessId: string, status: BusinessSettableStatus) =>
    apiClient.patch<HireAdminBusiness>(`${BASE}/${businessId}`, { status }),

  bulkSetStatus: (businessIds: string[], status: BusinessSettableStatus) =>
    apiClient.post<{ affected: number }>(`${BASE}/bulk`, {
      action: 'set_status',
      status,
      business_ids: businessIds
    }),

  /** Exports the filtered view, or only `businessIds` when any are given. Paging in `list` is ignored. */
  exportBusinesses: (list: BusinessesListParams, businessIds: string[]) =>
    apiClient.post<Job>(`${BASE}/exports`, { ...list, business_ids: businessIds })
};
