import { apiClient } from '@/shared/api/apiClient';
import type { SettingsNotifications } from '../schemas/adminSettingsNotifications';

const BASE = '/hire/admin/settings/notifications';

export const adminSettingsNotificationsApi = {
  get: () => apiClient.get<SettingsNotifications>(BASE),

  /** Full replace of the Notifications Settings payload; answers with the saved object. */
  save: (body: SettingsNotifications) => apiClient.patch<SettingsNotifications>(BASE, body)
};
