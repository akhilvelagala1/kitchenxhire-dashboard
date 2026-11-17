import { useCallback, useMemo, useState, type ReactNode } from 'react';
import {
  RecruiterSessionContext,
  readRecruiterSession,
  writeRecruiterSession,
  type RecruiterSessionContextValue,
  type RecruiterSessionState
} from '../lib/recruiterSession';

export function RecruiterSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<RecruiterSessionState | null>(() =>
    readRecruiterSession()
  );

  const setVerifiedPhone = useCallback((verified: string) => {
    const next: RecruiterSessionState = { phone: verified };
    writeRecruiterSession(next);
    setSession(next);
  }, []);

  const clearSession = useCallback(() => {
    writeRecruiterSession(null);
    setSession(null);
  }, []);

  const value = useMemo<RecruiterSessionContextValue>(
    () => ({ session, setVerifiedPhone, clearSession }),
    [session, setVerifiedPhone, clearSession]
  );

  return (
    <RecruiterSessionContext.Provider value={value}>{children}</RecruiterSessionContext.Provider>
  );
}
