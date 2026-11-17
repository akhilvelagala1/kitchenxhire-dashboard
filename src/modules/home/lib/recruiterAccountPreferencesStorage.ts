import {
  DEFAULT_RECRUITER_ACCOUNT_PREFERENCES,
  recruiterAccountPreferencesSchema,
  type RecruiterAccountPreferences
} from '../schemas/recruiterAccountPreferences';
import { recruiterScopedStorageKey } from './recruiterAccount';

const STORAGE_KEY_BASE = 'kx-hire-recruiter-preferences-v1';

function storageKey(accountId: string) {
  return recruiterScopedStorageKey(STORAGE_KEY_BASE, accountId);
}

/** Stored prefs re-validated on read so a stale or hand-edited blob falls back to the defaults. */
export function readRecruiterAccountPreferences(accountId: string): RecruiterAccountPreferences {
  try {
    const raw = localStorage.getItem(storageKey(accountId));
    if (!raw) return DEFAULT_RECRUITER_ACCOUNT_PREFERENCES;
    const data = JSON.parse(raw);
    const parsed = recruiterAccountPreferencesSchema.safeParse(data);
    return parsed.success ? parsed.data : DEFAULT_RECRUITER_ACCOUNT_PREFERENCES;
  } catch {
    // private mode / test env
    return DEFAULT_RECRUITER_ACCOUNT_PREFERENCES;
  }
}

export function writeRecruiterAccountPreferences(
  accountId: string,
  preferences: RecruiterAccountPreferences
): void {
  try {
    localStorage.setItem(storageKey(accountId), JSON.stringify(preferences));
  } catch {
    // private mode / test env
  }
}
