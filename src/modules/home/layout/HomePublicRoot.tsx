import { Outlet } from 'react-router';
import { HireLanguageProvider } from './HireLanguageProvider';
import { JobSeekerSessionProvider } from './JobSeekerSessionProvider';
import { RecruiterSessionProvider } from './RecruiterSessionProvider';

/** Wraps public home, /user, and /recruiter routes so login state is shared. */
export function HomePublicRoot() {
  return (
    <HireLanguageProvider>
      <JobSeekerSessionProvider>
        <RecruiterSessionProvider>
          <Outlet />
        </RecruiterSessionProvider>
      </JobSeekerSessionProvider>
    </HireLanguageProvider>
  );
}
