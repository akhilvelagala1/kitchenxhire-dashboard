import { apiClient } from '@/shared/api/apiClient';
import type { SettingsUsersRoles } from '../schemas/adminSettingsUsersRoles';

const BASE = '/hire/admin/settings/users-roles';

export const adminSettingsUsersRolesApi = {
  get: () => apiClient.get<SettingsUsersRoles>(BASE),

  /** Full replace of the Users & Roles Settings payload; answers with the saved object. */
  save: (body: SettingsUsersRoles) => apiClient.patch<SettingsUsersRoles>(BASE, body)
};
