import { useCallback, useMemo, useState, type ReactNode } from 'react';
import type { JobSeekerCandidateProfile } from '../schemas/jobSeekerOnboarding';
import {
  JobSeekerSessionContext,
  buildJobSeekerSessionForPhone,
  mergeJobSeekerSession,
  readJobSeekerSession,
  writeJobSeekerSession,
  type JobSeekerSessionContextValue,
  type JobSeekerSessionState
} from '../lib/jobSeekerSession';

export function JobSeekerSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<JobSeekerSessionState | null>(() =>
    readJobSeekerSession()
  );

  const setVerifiedPhone = useCallback((verified: string): JobSeekerSessionState => {
    const next = buildJobSeekerSessionForPhone(verified);
    writeJobSeekerSession(next);
    setSession(next);
    return next;
  }, []);

  const completeOnboarding = useCallback((candidate: JobSeekerCandidateProfile) => {
    setSession((prev) => {
      if (!prev) return prev;
      const next = mergeJobSeekerSession(prev, candidate, true);
      writeJobSeekerSession(next);
      return next;
    });
  }, []);

  const clearSession = useCallback(() => {
    writeJobSeekerSession(null);
    setSession(null);
  }, []);

  const value = useMemo<JobSeekerSessionContextValue>(
    () => ({
      session,
      setVerifiedPhone,
      completeOnboarding,
      clearSession
    }),
    [session, setVerifiedPhone, completeOnboarding, clearSession]
  );

  return (
    <JobSeekerSessionContext.Provider value={value}>{children}</JobSeekerSessionContext.Provider>
  );
}
