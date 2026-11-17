import { Suspense, useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { AuthDialog } from '../components/AuthDialog';
import { SiteFooter } from '../components/SiteFooter';
import { SiteHeader } from '../components/SiteHeader';
import { useJobSeekerSession } from '../lib/jobSeekerSession';
import { useRecruiterSession } from '../lib/recruiterSession';
import { useHireLanguage } from '../hooks/useHireLanguage';
import { HomeStateProvider } from './HomeStateProvider';

/** Root of the public homepage: prototype type, page background, and smooth in-page scrolling. */
export function HomeLayout() {
  const { tx } = useHireLanguage();
  const [authOpen, setAuthOpen] = useState(false);
  const navigate = useNavigate();
  const { clearSession, setVerifiedPhone } = useJobSeekerSession();
  const { clearSession: clearRecruiterSession, setVerifiedPhone: setRecruiterPhone } =
    useRecruiterSession();

  useEffect(() => {
    document.documentElement.classList.add('kx-smooth');
    return () => document.documentElement.classList.remove('kx-smooth');
  }, []);

  /** Marketing home is always the guest experience; leaving /user clears the job seeker session. */
  useEffect(() => {
    clearSession();
    clearRecruiterSession();
  }, [clearRecruiterSession, clearSession]);

  return (
    <HomeStateProvider>
      <div className="kx-home min-h-dvh overflow-x-clip bg-muted font-hire text-base text-ink">
        <a
          href="#top"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-full focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-bold"
        >
          {tx('Skip to content')}
        </a>
        <SiteHeader onLogin={() => setAuthOpen(true)} />
        <Suspense fallback={null}>
          <Outlet />
        </Suspense>
        <SiteFooter />
        <AuthDialog
          open={authOpen}
          onClose={() => setAuthOpen(false)}
          onVerified={({ phone, intent }) => {
            if (intent === 'recruiter') {
              clearSession();
              setRecruiterPhone(phone);
              navigate('/recruiter');
              return;
            }
            clearRecruiterSession();
            setVerifiedPhone(phone);
            navigate('/user');
          }}
        />
      </div>
    </HomeStateProvider>
  );
}
