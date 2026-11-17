import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useJobSeekerSession } from '../lib/jobSeekerSession';

/**
 * Incomplete seekers stay on /user (Find Jobs + onboarding overlay).
 * Other /user/* routes redirect until the minimum profile is complete.
 */
export function UserOnboardingGuard({ children }: { children: ReactNode }) {
  const { session } = useJobSeekerSession();
  const { pathname } = useLocation();

  if (!session) {
    return <Navigate to="/" replace />;
  }

  const onFindJobs = pathname === '/user' || pathname === '/user/';
  if (!session.profileComplete && !onFindJobs) {
    return <Navigate to="/user" replace />;
  }

  return children;
}
