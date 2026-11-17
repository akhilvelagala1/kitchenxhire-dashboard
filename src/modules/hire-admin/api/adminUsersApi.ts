import { apiClient } from '@/shared/api/apiClient';
import type { Job, ListQuery } from '@/shared/api/types';
import type {
  HireAdminUser,
  HireUsersSummary,
  UserInput,
  UserRole,
  UserDepartment,
  UserSettableStatus,
  UserStatus,
  UserTab
} from '../schemas/adminUser';
import type { JoinedPreset } from '../schemas/listDashboard';

const BASE = '/hire/admin/users';

/** Filters use snake_case query keys. `active` limits to people seen (or invited) in that window. */
export interface UsersListParams extends ListQuery {
  tab?: UserTab;
  status?: UserStatus;
  role?: UserRole;
  department?: UserDepartment;
  active?: Exclude<JoinedPreset, 'all'>;
}

export const adminUsersApi = {
  summary: () => apiClient.get<HireUsersSummary>(`${BASE}/summary`),

  list: (q: UsersListParams) => apiClient.list<HireAdminUser>(BASE, q),

  create: (body: UserInput) => apiClient.post<HireAdminUser>(BASE, body),

  update: (userId: string, body: Partial<UserInput>) =>
    apiClient.patch<HireAdminUser>(`${BASE}/${userId}`, body),

  setStatus: (userId: string, status: UserSettableStatus) =>
    apiClient.patch<HireAdminUser>(`${BASE}/${userId}`, { status }),

  bulkSetStatus: (userIds: string[], status: UserSettableStatus) =>
    apiClient.post<{ affected: number }>(`${BASE}/bulk`, {
      action: 'set_status',
      status,
      user_ids: userIds
    }),

  /** Exports the filtered view, or only `userIds` when any are given. Paging in `list` is ignored. */
  exportUsers: (list: UsersListParams, userIds: string[]) =>
    apiClient.post<Job>(`${BASE}/exports`, { ...list, user_ids: userIds })
};
