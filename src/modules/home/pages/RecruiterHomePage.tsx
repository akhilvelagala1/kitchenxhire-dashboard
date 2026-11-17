import { Navigate } from 'react-router';
import { RecruiterBusinessSetupCard } from '../components/RecruiterBusinessSetupCard';
import { RecruiterHero } from '../components/RecruiterHero';
import { RecruiterRecentApplications } from '../components/RecruiterRecentApplications';
import { RecruiterStatCards } from '../components/RecruiterStatCards';
import { pageWrap } from '../components/styles';
import { useRecruiterDashboard } from '../hooks/useRecruiterDashboard';
import { normalizeRecruiterAccountId } from '../lib/recruiterAccount';
import { useRecruiterSession } from '../lib/recruiterSession';

function RecruiterHomeDashboard() {
  const dashboard = useRecruiterDashboard();

  return (
    <main
      id="main"
      className={`${pageWrap} space-y-4 pb-10 pt-4 min-[900px]:space-y-[18px] min-[900px]:pt-5`}
    >
      <RecruiterStatCards
        metrics={dashboard.metrics}
        onJobsClick={() => dashboard.setJobId('all')}
        onApplicantsClick={() => dashboard.applyStatusFilterFromMetric('all')}
        onSelectedClick={() => dashboard.applyStatusFilterFromMetric('selected-hired')}
        onRejectedClick={() => dashboard.applyStatusFilterFromMetric('rejected')}
      />
      <RecruiterRecentApplications dashboard={dashboard} />
    </main>
  );
}

export function RecruiterHomePage() {
  const { session } = useRecruiterSession();

  if (!session) {
    return <Navigate to="/" replace />;
  }

  const accountId = normalizeRecruiterAccountId(session.phone);

  return (
    <>
      <title>KitchenX Hiring | Recruiter Home</title>
      <RecruiterHero />
      <RecruiterBusinessSetupCard key={accountId} />
      <RecruiterHomeDashboard key={accountId} />
    </>
  );
}
