import { createContext, useContext } from 'react';

export const RECRUITER_SESSION_KEY = 'kx-hire-recruiter-session';

export interface RecruiterSessionState {
  phone: string;
}

function parseSession(raw: string | null): RecruiterSessionState | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as unknown;
    if (
      typeof data === 'object' &&
      data !== null &&
      'phone' in data &&
      typeof (data as RecruiterSessionState).phone === 'string'
    ) {
      return data as RecruiterSessionState;
    }
  } catch {
    return null;
  }
  return null;
}

export function readRecruiterSession(): RecruiterSessionState | null {
  try {
    return parseSession(sessionStorage.getItem(RECRUITER_SESSION_KEY));
  } catch {
    return null;
  }
}

export function writeRecruiterSession(session: RecruiterSessionState | null) {
  try {
    if (session) {
      sessionStorage.setItem(RECRUITER_SESSION_KEY, JSON.stringify(session));
    } else {
      sessionStorage.removeItem(RECRUITER_SESSION_KEY);
    }
  } catch {
    // Vitest/jsdom may omit sessionStorage in some Node builds.
  }
}

export interface RecruiterSessionContextValue {
  session: RecruiterSessionState | null;
  setVerifiedPhone: (phone: string) => void;
  clearSession: () => void;
}

export const RecruiterSessionContext = createContext<RecruiterSessionContextValue | null>(null);

export function useRecruiterSession(): RecruiterSessionContextValue {
  const ctx = useContext(RecruiterSessionContext);
  if (!ctx) {
    throw new Error('useRecruiterSession must be used within RecruiterSessionProvider');
  }
  return ctx;
}
