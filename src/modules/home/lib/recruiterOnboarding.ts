import { useCallback, useEffect, useState } from 'react';
import type { RecruiterProfile } from '../schemas/recruiterOnboarding';
import { recruiterOnboardingSchema } from '../schemas/recruiterOnboarding';
import { normalizeRecruiterAccountId, recruiterScopedStorageKey } from './recruiterAccount';
import { writeRecruiterOrganisationDraft } from './recruiterOrganisationStorage';

const RECRUITER_PROFILE_KEY_BASE = 'kx-hire-recruiter-profile-v1';

/** Fired after a save so the header avatar and menu pick up the new name without a reload. */
const RECRUITER_PROFILE_UPDATED_EVENT = 'kx-hire-recruiter-profile-updated';

export interface RecruiterProfileRecord {
  profile: RecruiterProfile;
  completedAt: string;
}

function storageKey(accountId: string) {
  return recruiterScopedStorageKey(RECRUITER_PROFILE_KEY_BASE, accountId);
}

/** Stored record re-validated on read so a stale or hand-edited blob cannot break the gate. */
function readRecord(accountId: string): RecruiterProfileRecord | null {
  try {
    const raw = localStorage.getItem(storageKey(accountId));
    if (!raw) return null;
    const data = JSON.parse(raw) as RecruiterProfileRecord;
    if (typeof data?.completedAt !== 'string') return null;
    const parsed = recruiterOnboardingSchema.safeParse(data.profile);
    return parsed.success ? { profile: parsed.data, completedAt: data.completedAt } : null;
  } catch {
    // private mode / test env
    return null;
  }
}

export function isRecruiterProfileComplete(accountId: string): boolean {
  return readRecord(accountId) !== null;
}

export function getRecruiterProfile(accountId: string): RecruiterProfile | null {
  return readRecord(accountId)?.profile ?? null;
}

/**
 * Saves the recruiter's own details and feeds the business basics into the existing
 * organisation draft, so /recruiter/organization opens pre-filled instead of asking twice.
 * GST, address and PIN stay with the organisation form.
 */
export function saveRecruiterProfile(
  accountId: string,
  profile: RecruiterProfile
): RecruiterProfileRecord {
  const record: RecruiterProfileRecord = {
    profile,
    completedAt: new Date().toISOString()
  };
  try {
    localStorage.setItem(storageKey(accountId), JSON.stringify(record));
  } catch {
    // private mode / test env
  }
  writeRecruiterOrganisationDraft(accountId, {
    name: profile.businessName,
    businessType: profile.businessType,
    city: profile.city
  });
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(RECRUITER_PROFILE_UPDATED_EVENT));
  }
  return record;
}

/** Initials for the header avatar; falls back to a neutral mark before onboarding saves. */
export function recruiterInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'R';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ''}${parts[parts.length - 1]![0] ?? ''}`.toUpperCase();
}

/** Live view of the stored profile so the header avatar updates the moment onboarding saves. */
export function useRecruiterProfile(phone: string | null | undefined): RecruiterProfile | null {
  const accountId = phone ? normalizeRecruiterAccountId(phone) : '';
  const read = useCallback(() => (accountId ? getRecruiterProfile(accountId) : null), [accountId]);
  const [profile, setProfile] = useState<RecruiterProfile | null>(read);

  useEffect(() => {
    function onUpdated() {
      setProfile(read());
    }
    window.addEventListener(RECRUITER_PROFILE_UPDATED_EVENT, onUpdated);
    return () => window.removeEventListener(RECRUITER_PROFILE_UPDATED_EVENT, onUpdated);
  }, [read]);

  return profile;
}
