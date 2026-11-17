import { apiClient } from '@/shared/api/apiClient';
import type { SettingsIntegrations } from '../schemas/adminSettingsIntegrations';

const BASE = '/hire/admin/settings/integrations';

export const adminSettingsIntegrationsApi = {
  get: () => apiClient.get<SettingsIntegrations>(BASE),

  /** Full replace of the Integrations Settings payload; answers with the saved object. */
  save: (body: SettingsIntegrations) => apiClient.patch<SettingsIntegrations>(BASE, body)
};
