import { Suspense, useEffect } from 'react';
import { Outlet } from 'react-router';
import { RecruiterOnboardingOverlay } from '../components/RecruiterOnboardingOverlay';
import { RecruiterSiteHeader } from '../components/RecruiterSiteHeader';
import { useHireLanguage } from '../hooks/useHireLanguage';
import { useRecruiterSession } from '../lib/recruiterSession';
import { HomeStateProvider } from './HomeStateProvider';

/** Recruiter shell for /recruiter routes (public hire realm, not AppShell). */
export function RecruiterLayout() {
  const { tx } = useHireLanguage();
  const { session } = useRecruiterSession();
  useEffect(() => {
    document.documentElement.classList.add('kx-smooth');
    return () => document.documentElement.classList.remove('kx-smooth');
  }, []);

  return (
    <HomeStateProvider>
      <div className="kx-home flex min-h-dvh flex-col overflow-x-clip bg-canvas font-hire text-base text-ink">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-full focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-bold"
        >
          {tx('Skip to content')}
        </a>
        <RecruiterSiteHeader />
        <div className="flex min-h-0 flex-1 flex-col">
          <Suspense fallback={null}>
            <Outlet />
          </Suspense>
        </div>
        {session ? <RecruiterOnboardingOverlay key={session.phone} /> : null}
      </div>
    </HomeStateProvider>
  );
}
