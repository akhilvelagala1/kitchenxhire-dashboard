import { useMemo, useState } from 'react';
import { ApplicationDetailDialog } from '../components/ApplicationDetailDialog';
import { ApplicationFilterPills } from '../components/ApplicationFilterPills';
import { ApplicationListCard } from '../components/ApplicationListCard';
import { FindJobsPagination } from '../components/FindJobsPagination';
import { JobDialog } from '../components/JobDialog';
import { JobSeekerIncompleteProfileDialog } from '../components/JobSeekerIncompleteProfileDialog';
import { SavedJobsPanel } from '../components/SavedJobsPanel';
import { secLead, secTitle } from '../components/styles';
import { applicationsRangeLine } from '../content/hireResultCopy';
import { useHireLanguage } from '../hooks/useHireLanguage';
import { useJobApplications } from '../hooks/useJobApplications';
import { useSavedJobs } from '../hooks/useSavedJobs';
import { canApplyWithProfile } from '../lib/jobSeekerProfile';
import { useJobSeekerSession } from '../lib/jobSeekerSession';
import {
  countApplicationsByStatus,
  filterApplicationsByStatus,
  paginateApplications,
  sortApplicationsNewestFirst,
  totalApplicationPages
} from '../lib/jobApplications';
import type { SavedJobListing } from '../lib/savedJobs';
import {
  APPLICATIONS_PAGE_SIZE,
  isFindJobListing,
  type JobApplication
} from '../schemas/jobApplication';
import type { MyApplicationsTab } from '../schemas/savedJobs';

export function MyApplicationsPage() {
  const { language } = useHireLanguage();
  const { applications, applyFromListing } = useJobApplications();
  const { savedJobs, savedCount, removeSavedJob } = useSavedJobs();
  const { session } = useJobSeekerSession();
  const [tab, setTab] = useState<MyApplicationsTab>('all');
  const [page, setPage] = useState(1);
  const [active, setActive] = useState<JobApplication | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [applyJob, setApplyJob] = useState<SavedJobListing | null>(null);
  const [completeProfileOpen, setCompleteProfileOpen] = useState(false);
  const [pendingApply, setPendingApply] = useState<SavedJobListing | null>(null);

  const byStatus = useMemo(() => countApplicationsByStatus(applications), [applications]);
  const filtered = useMemo(() => {
    if (tab === 'saved') return [];
    return sortApplicationsNewestFirst(filterApplicationsByStatus(applications, tab));
  }, [applications, tab]);

  const totalCount = filtered.length;
  const totalPages = totalApplicationPages(totalCount, APPLICATIONS_PAGE_SIZE);
  const safePage = Math.min(page, totalPages);
  const pageItems = paginateApplications(filtered, safePage, APPLICATIONS_PAGE_SIZE);
  const rangeStart = totalCount === 0 ? 0 : (safePage - 1) * APPLICATIONS_PAGE_SIZE + 1;
  const rangeEnd = Math.min(safePage * APPLICATIONS_PAGE_SIZE, totalCount);

  function onTabChange(next: MyApplicationsTab) {
    setTab(next);
    setPage(1);
  }

  function onApplySaved(job: SavedJobListing) {
    if (!canApplyWithProfile(session?.profileComplete ?? false, session?.candidate)) {
      setPendingApply(job);
      setCompleteProfileOpen(true);
      return;
    }
    setApplyJob(job);
  }

  return (
    <>
      <title>KitchenX Hiring | My Applications</title>
      <div>
        <h1 // guard-allow: job seeker public page matches Find Jobs / prototype, not console PageHeader
          className={secTitle}
        >
          My Applications
        </h1>
        <p className={secLead}>Track the status of jobs you have applied for.</p>

        <div className="mt-3">
          <ApplicationFilterPills
            active={tab}
            total={applications.length}
            byStatus={byStatus}
            savedCount={savedCount}
            onChange={onTabChange}
          />
        </div>

        {tab === 'saved' ? (
          <SavedJobsPanel savedJobs={savedJobs} onUnsave={removeSavedJob} onApply={onApplySaved} />
        ) : filtered.length === 0 ? (
          <div className="mt-8 rounded-[18px] border border-line bg-surface px-6 py-10 text-center shadow-card">
            <p className="text-[15px] font-extrabold text-ink">
              No applications in this filter yet.
            </p>
            <p className="mt-2 text-sm font-medium text-ink-500">
              Apply from Find Jobs and your submissions will show up here automatically.
            </p>
          </div>
        ) : (
          <section
            aria-label="Application results"
            className="mt-5 min-w-0 rounded-[18px] border border-line bg-surface p-4 shadow-card min-[768px]:p-5"
          >
            <ul className="flex flex-col gap-3">
              {pageItems.map((application) => (
                <li key={application.id}>
                  <ApplicationListCard
                    application={application}
                    selected={selectedId === application.id}
                    onSelect={() => setSelectedId(application.id)}
                    onViewDetails={() => setActive(application)}
                  />
                </li>
              ))}
            </ul>
            {totalCount > 0 ? (
              <div className="mt-5 flex flex-col gap-3 border-t border-line pt-4 min-[768px]:flex-row min-[768px]:items-center min-[768px]:justify-between min-[768px]:gap-6">
                <p className="shrink-0 text-[13px] font-semibold text-ink-600">
                  {applicationsRangeLine(language, rangeStart, rangeEnd, totalCount)}
                </p>
                {totalPages > 1 ? (
                  <div className="min-w-0 min-[768px]:flex-1">
                    <FindJobsPagination
                      page={safePage}
                      totalPages={totalPages}
                      onPageChange={setPage}
                      className="mt-0 justify-start border-0 pt-0 min-[768px]:justify-end"
                    />
                  </div>
                ) : null}
              </div>
            ) : null}
          </section>
        )}
      </div>
      <ApplicationDetailDialog application={active} onClose={() => setActive(null)} />
      <JobDialog
        job={applyJob}
        onClose={() => setApplyJob(null)}
        onApply={(job) => {
          if (!isFindJobListing(job)) return;
          applyFromListing(job);
          setApplyJob(null);
        }}
      />
      <JobSeekerIncompleteProfileDialog
        open={completeProfileOpen}
        onClose={() => {
          setCompleteProfileOpen(false);
          setPendingApply(null);
        }}
        onComplete={() => {
          if (pendingApply) {
            applyFromListing(pendingApply);
            setApplyJob(null);
          }
          setPendingApply(null);
        }}
      />
    </>
  );
}
