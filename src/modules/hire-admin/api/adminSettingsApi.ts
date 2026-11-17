import { apiClient } from '@/shared/api/apiClient';
import type { HireAdminSettings, SettingsPatch } from '../schemas/adminSettings';

const BASE = '/hire/admin/settings';

export const adminSettingsApi = {
  get: () => apiClient.get<HireAdminSettings>(BASE),

  /** Changes only the fields sent and returns the whole settings. */
  update: (body: SettingsPatch) => apiClient.patch<HireAdminSettings>(BASE, body),

  /** Multipart upload of a PNG or JPG up to 2 MB; returns the whole settings with the new `logo_url`. */
  uploadLogo: (file: File) => apiClient.upload<HireAdminSettings>(`${BASE}/logo`, file)
};
