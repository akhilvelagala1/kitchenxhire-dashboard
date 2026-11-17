import { createContext, useContext } from 'react';
import type { JobSeekerCandidateProfile } from '../schemas/jobSeekerOnboarding';
import {
  knownCompleteCandidate,
  placeholderJobSeekerProfile,
  profileFromCandidate,
  type JobSeekerProfile
} from './jobSeekerProfile';

export const JOB_SEEKER_SESSION_KEY = 'kx-hire-job-seeker-session';
/** @deprecated Legacy phone-only key; migrated on read. */
export const JOB_SEEKER_LEGACY_PHONE_KEY = 'kx-hire-job-seeker-phone';

export interface JobSeekerSessionState {
  phone: string;
  profile: JobSeekerProfile;
  profileComplete: boolean;
  candidate?: JobSeekerCandidateProfile;
}

function parseSession(raw: string | null): JobSeekerSessionState | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as unknown;
    if (typeof data !== 'object' || data === null) return null;
    const row = data as JobSeekerSessionState;
    if (typeof row.phone !== 'string') return null;
    if (typeof row.profile?.displayName !== 'string' || typeof row.profile?.initials !== 'string') {
      return null;
    }
    const profileComplete = row.profileComplete === true;
    return {
      phone: row.phone,
      profile: row.profile,
      profileComplete,
      candidate: row.candidate
    };
  } catch {
    return null;
  }
}

/** Migrate older sessions that lacked profileComplete but used demo names. */
function normalizeSession(session: JobSeekerSessionState): JobSeekerSessionState {
  if (session.profileComplete) return session;
  const known = knownCompleteCandidate(session.phone);
  if (known && session.profile.displayName === known.profile.displayName) {
    return {
      phone: session.phone,
      profile: known.profile,
      profileComplete: true,
      candidate: {
        fullName: known.fullName,
        preferredRole: known.preferredRole,
        city: known.city,
        workExperience: known.workExperience
      }
    };
  }
  return session;
}

export function buildJobSeekerSessionForPhone(phone: string): JobSeekerSessionState {
  const known = knownCompleteCandidate(phone);
  if (known) {
    return {
      phone,
      profile: known.profile,
      profileComplete: true,
      candidate: {
        fullName: known.fullName,
        preferredRole: known.preferredRole,
        city: known.city,
        workExperience: known.workExperience
      }
    };
  }
  return {
    phone,
    profile: placeholderJobSeekerProfile(),
    profileComplete: false
  };
}

export function readJobSeekerSession(): JobSeekerSessionState | null {
  try {
    const current = parseSession(sessionStorage.getItem(JOB_SEEKER_SESSION_KEY));
    if (current) return normalizeSession(current);

    const legacyPhone = sessionStorage.getItem(JOB_SEEKER_LEGACY_PHONE_KEY);
    if (legacyPhone) {
      const migrated = buildJobSeekerSessionForPhone(legacyPhone);
      writeJobSeekerSession(migrated);
      sessionStorage.removeItem(JOB_SEEKER_LEGACY_PHONE_KEY);
      return migrated;
    }
  } catch {
    return null;
  }
  return null;
}

export function writeJobSeekerSession(session: JobSeekerSessionState | null) {
  try {
    if (session) {
      sessionStorage.setItem(JOB_SEEKER_SESSION_KEY, JSON.stringify(session));
      sessionStorage.removeItem(JOB_SEEKER_LEGACY_PHONE_KEY);
    } else {
      sessionStorage.removeItem(JOB_SEEKER_SESSION_KEY);
      sessionStorage.removeItem(JOB_SEEKER_LEGACY_PHONE_KEY);
    }
  } catch {
    // Vitest/jsdom may omit sessionStorage in some Node builds.
  }
}

export function mergeJobSeekerSession(
  session: JobSeekerSessionState,
  candidate: JobSeekerCandidateProfile,
  profileComplete: boolean
): JobSeekerSessionState {
  return {
    phone: session.phone,
    profile: profileFromCandidate(candidate),
    profileComplete,
    candidate
  };
}

export interface JobSeekerSessionContextValue {
  session: JobSeekerSessionState | null;
  setVerifiedPhone: (phone: string) => JobSeekerSessionState;
  completeOnboarding: (candidate: JobSeekerCandidateProfile) => void;
  clearSession: () => void;
}

export const JobSeekerSessionContext = createContext<JobSeekerSessionContextValue | null>(null);

export function useJobSeekerSession(): JobSeekerSessionContextValue {
  const ctx = useContext(JobSeekerSessionContext);
  if (!ctx) {
    throw new Error('useJobSeekerSession must be used within JobSeekerSessionProvider');
  }
  return ctx;
}
