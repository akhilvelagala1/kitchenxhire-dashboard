import { Link, Navigate } from 'react-router';
import { useMemo, useState } from 'react';
import { RecruiterMarketJobsPanel } from '../components/RecruiterMarketJobsPanel';
import { RecruiterMyApplicationsFilters } from '../components/RecruiterMyApplicationsFilters';
import { RecruiterMyApplicationsJobsSearch } from '../components/RecruiterMyApplicationsJobsSearch';
import { RecruiterMyApplicationsJobsTable } from '../components/RecruiterMyApplicationsJobsTable';
import { RecruiterMyApplicationsStats } from '../components/RecruiterMyApplicationsStats';
import { RecruiterMyApplicationsTable } from '../components/RecruiterMyApplicationsTable';
import { RecruiterMyApplicationsTabs } from '../components/RecruiterMyApplicationsTabs';
import {
  recruiterMyApplicationsDashboardGrid,
  recruiterMyApplicationsLead,
  recruiterMyApplicationsPage,
  recruiterMyApplicationsTableCard,
  recruiterMyApplicationsTitle
} from '../components/recruiterMyApplicationsStyles';
import { FindJobsPagination } from '../components/FindJobsPagination';
import { homeButton } from '../components/styles';
import { useRecruiterJobsPostedSearch } from '../hooks/useRecruiterJobsPostedSearch';
import { useRecruiterMyApplicationsDashboard } from '../hooks/useRecruiterMyApplicationsDashboard';
import { computeRecruiterMetrics } from '../lib/recruiterDashboard';
import { normalizeRecruiterAccountId } from '../lib/recruiterAccount';
import { listRecruiterJobsWithStats } from '../lib/recruiterPostedJobsStore';
import { useRecruiterSession } from '../lib/recruiterSession';
import type { RecruiterMyApplicationsTab } from '../schemas/recruiterApplication';

function RecruiterMyApplicationsDashboardView() {
  const dashboard = useRecruiterMyApplicationsDashboard();
  const [activeView, setActiveView] = useState<'applications' | 'jobs'>('applications');
  const metrics = useMemo(
    () => computeRecruiterMetrics(dashboard.applications, dashboard.accountId),
    [dashboard.applications, dashboard.accountId]
  );

  const activeTab: RecruiterMyApplicationsTab = dashboard.query.tab ?? 'all';

  const jobsWithStats = useMemo(
    () => listRecruiterJobsWithStats(dashboard.accountId, dashboard.applications),
    [dashboard.accountId, dashboard.applications]
  );

  const jobsSearch = useRecruiterJobsPostedSearch(jobsWithStats);

  return (
    <div className={recruiterMyApplicationsDashboardGrid}>
      <div className="min-w-0 space-y-6">
        <RecruiterMyApplicationsStats
          metrics={metrics}
          activeView={activeView}
          activeTab={activeTab}
          onSelectJobsPosted={() => setActiveView('jobs')}
          onSelectTab={(tab) => {
            setActiveView('applications');
            dashboard.setTab(tab);
          }}
        />

        {activeView === 'jobs' ? (
          <>
            <RecruiterMyApplicationsJobsSearch
              value={jobsSearch.search}
              onChange={jobsSearch.setSearch}
            />

            {jobsSearch.pageResult.slice.length === 0 ? (
              <div className="rounded-2xl border border-[#eef0f5] bg-white px-6 py-14 text-center shadow-[0_5px_18px_rgb(22_30_50/0.05)]">
                <p className="text-[18px] font-bold text-[#141517]">No jobs match your search</p>
                <p className="mt-2 text-[15px] font-medium text-[#243754]">
                  Try a different job title, or clear the search to see all posted jobs.
                </p>
              </div>
            ) : (
              <div className={recruiterMyApplicationsTableCard}>
                <RecruiterMyApplicationsJobsTable rows={jobsSearch.pageResult.slice} />
                <div className="flex flex-col gap-3 border-t border-line px-4 py-4 min-[768px]:flex-row min-[768px]:items-center min-[768px]:justify-between min-[768px]:gap-6 min-[1024px]:px-5">
                  <p className="text-[14px] font-medium text-[#243754]">
                    Showing {jobsSearch.pageResult.rangeStart}–{jobsSearch.pageResult.rangeEnd} of{' '}
                    {jobsSearch.pageResult.total} jobs
                  </p>
                  <div className="min-w-0 flex-1 [&_nav]:mt-0 [&_nav]:border-0 [&_nav]:justify-end [&_nav]:pt-0">
                    <FindJobsPagination
                      page={jobsSearch.pageResult.page}
                      totalPages={jobsSearch.pageResult.totalPages}
                      onPageChange={jobsSearch.setPage}
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <RecruiterMyApplicationsTabs
              active={activeTab}
              metrics={metrics}
              onChange={dashboard.setTab}
            />

            <RecruiterMyApplicationsFilters dashboard={dashboard} />

            {dashboard.pageResult.slice.length === 0 ? (
              <div className="rounded-2xl border border-[#eef0f5] bg-white px-6 py-14 text-center shadow-[0_5px_18px_rgb(22_30_50/0.05)]">
                <p className="text-[18px] font-bold text-[#141517]">No applications yet</p>
                <p className="mt-2 text-[15px] font-medium text-[#243754]">
                  {dashboard.filtersActive || activeTab !== 'all'
                    ? 'No matching candidates for your filters. Try clearing filters or choosing another tab.'
                    : 'Your job postings are waiting for candidates. Once someone applies, their application will appear here.'}
                </p>
                {!dashboard.filtersActive && activeTab === 'all' && (
                  <Link
                    to="/recruiter/post-job"
                    className={`${homeButton('orange-base')} mt-6 inline-flex`}
                  >
                    Post a Job
                  </Link>
                )}
              </div>
            ) : (
              <div className={recruiterMyApplicationsTableCard}>
                <RecruiterMyApplicationsTable
                  rows={dashboard.pageResult.slice}
                  accountId={dashboard.accountId}
                  onAccept={dashboard.accept}
                  onReject={dashboard.reject}
                  onUpdateNotes={dashboard.updateNotes}
                />
                <div className="flex flex-col gap-3 border-t border-line px-4 py-4 min-[768px]:flex-row min-[768px]:items-center min-[768px]:justify-between min-[768px]:gap-6 min-[1024px]:px-5">
                  <p className="text-[14px] font-medium text-[#243754]">
                    Showing {dashboard.pageResult.rangeStart}–{dashboard.pageResult.rangeEnd} of{' '}
                    {dashboard.pageResult.total} applications
                  </p>
                  <div className="min-w-0 flex-1 [&_nav]:mt-0 [&_nav]:border-0 [&_nav]:justify-end [&_nav]:pt-0">
                    <FindJobsPagination
                      page={dashboard.pageResult.page}
                      totalPages={dashboard.pageResult.totalPages}
                      onPageChange={dashboard.setPage}
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <RecruiterMarketJobsPanel />
    </div>
  );
}

export function RecruiterMyApplicationsPage() {
  const { session } = useRecruiterSession();
  const accountId = session ? normalizeRecruiterAccountId(session.phone) : '';

  if (!session) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <title>KitchenX Hiring | My Applications</title>
      <main id="main" className={recruiterMyApplicationsPage}>
        <header>
          <h1 // guard-allow: recruiter My Applications uses reference marketing page heading, not admin PageHeader
            className={recruiterMyApplicationsTitle}
          >
            My Applications
          </h1>
          <p className={recruiterMyApplicationsLead}>
            Manage candidates who have applied to your job postings.
          </p>
        </header>

        <RecruiterMyApplicationsDashboardView key={accountId} />
      </main>
    </>
  );
}
