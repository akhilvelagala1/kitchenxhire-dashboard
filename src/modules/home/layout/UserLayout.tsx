import { Suspense, useEffect } from 'react';
import { Outlet } from 'react-router';
import { JobSeekerOnboardingOverlay } from '../components/JobSeekerOnboardingOverlay';
import { UserSiteHeader } from '../components/UserSiteHeader';
import { useHireLanguage } from '../hooks/useHireLanguage';
import { useJobSeekerSession } from '../lib/jobSeekerSession';
import { HomeStateProvider } from './HomeStateProvider';
import { UserOnboardingGuard } from './UserOnboardingGuard';

/** Logged-in job seeker shell for /user routes (prototype, no AppShell). */
export function UserLayout() {
  const { tx } = useHireLanguage();
  const { session } = useJobSeekerSession();

  useEffect(() => {
    document.documentElement.classList.add('kx-smooth');
    return () => document.documentElement.classList.remove('kx-smooth');
  }, []);

  return (
    <HomeStateProvider>
      <div className="kx-home min-h-dvh overflow-x-clip bg-canvas font-hire text-base text-ink">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-full focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-bold"
        >
          {tx('Skip to content')}
        </a>
        <UserSiteHeader />
        <UserOnboardingGuard>
          <Suspense fallback={null}>
            <Outlet />
          </Suspense>
        </UserOnboardingGuard>
        {session ? <JobSeekerOnboardingOverlay /> : null}
      </div>
    </HomeStateProvider>
  );
}
