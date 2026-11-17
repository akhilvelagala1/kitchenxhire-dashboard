import { Navigate } from 'react-router';
import { FindJobsBrowse } from '../components/FindJobsBrowse';
import { useRecruiterSession } from '../lib/recruiterSession';

/** Full market job catalog — same browse UX as job seeker Find Jobs. */
export function RecruiterMarketJobsPage() {
  const { session } = useRecruiterSession();

  if (!session) {
    return <Navigate to="/" replace />;
  }

  return <FindJobsBrowse documentTitle="KitchenX Hiring | Market Jobs" />;
}
