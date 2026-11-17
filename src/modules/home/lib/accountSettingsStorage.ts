import { buildAccountSettings, type AccountSettingsValues } from './accountSettings';
import type { JobSeekerSessionState } from './jobSeekerSession';

const STORAGE_KEY = 'kx-hire-account-settings';

function storageKey(phone: string): string {
  return `${STORAGE_KEY}:${phone || 'guest'}`;
}

export function readAccountSettings(
  phone: string,
  session: JobSeekerSessionState | null
): AccountSettingsValues {
  const fallback = buildAccountSettings(session);
  try {
    const raw = sessionStorage.getItem(storageKey(phone));
    if (!raw) return fallback;
    const data = JSON.parse(raw) as Partial<AccountSettingsValues>;
    return { ...fallback, ...data, photoDataUrl: data.photoDataUrl ?? '' };
  } catch {
    return fallback;
  }
}

export function writeAccountSettings(phone: string, values: AccountSettingsValues): void {
  try {
    sessionStorage.setItem(storageKey(phone), JSON.stringify(values));
  } catch {
    // Private mode or a test runner may omit sessionStorage.
  }
}

export function clearAccountSettings(phone: string): void {
  try {
    sessionStorage.removeItem(storageKey(phone));
  } catch {
    // Private mode or a test runner may omit sessionStorage.
  }
}
