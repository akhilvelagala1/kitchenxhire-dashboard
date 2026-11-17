import { apiClient } from '@/shared/api/apiClient';
import type {
  SettingsActiveSession,
  SettingsLoginHistoryEntry,
  SettingsSecurity
} from '../schemas/adminSettingsSecurity';

const BASE = '/hire/admin/settings/security';

export const adminSettingsSecurityApi = {
  get: () => apiClient.get<SettingsSecurity>(BASE),

  /** Full replace of the Security Settings payload; answers with the saved object. */
  save: (body: SettingsSecurity) => apiClient.patch<SettingsSecurity>(BASE, body),

  loginHistory: () => apiClient.get<SettingsLoginHistoryEntry[]>(`${BASE}/login-history`),

  sessions: () => apiClient.get<SettingsActiveSession[]>(`${BASE}/sessions`),

  /** Ends one session; answers with the sessions that remain. */
  revokeSession: (id: string) =>
    apiClient.post<SettingsActiveSession[]>(`${BASE}/sessions/${id}/revoke`)
};
