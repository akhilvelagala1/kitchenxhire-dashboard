import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { jobsRangeLine } from '../content/hireResultCopy';
import { useHireLanguage } from '../hooks/useHireLanguage';
import { FindJobListCard } from './FindJobListCard';
import { FindJobsHero } from './FindJobsHero';
import { FindJobsPagination } from './FindJobsPagination';
import { FindJobsTrustBand } from './FindJobsTrustBand';
import { JobFiltersPanel } from './JobFiltersPanel';
import { JobDialog } from './JobDialog';
import { JobsSortMenu } from './JobsSortMenu';
import { pageWrap } from './styles';
import { FIND_JOBS_CATALOG } from '../content/findJobsCatalog';
import { useFindJobsQuery } from '../hooks/useFindJobsQuery';
import { useHomeState } from '../hooks/useHomeState';
import { useJobApplications } from '../hooks/useJobApplications';
import { useSavedJobs } from '../hooks/useSavedJobs';
import { isFindJobListing } from '../schemas/jobApplication';
import { filterFindJobs, paginateFindJobs, sortFindJobs, totalFindJobPages } from '../lib/findJobs';
import type { Job } from '../schemas/home';
import type { FindJobListing } from '../schemas/findJobs';
import { FIND_JOBS_PAGE_SIZE } from '../schemas/findJobs';
import { JobSeekerIncompleteProfileDialog } from './JobSeekerIncompleteProfileDialog';
import { useJobSeekerSession } from '../lib/jobSeekerSession';
import { canApplyWithProfile } from '../lib/jobSeekerProfile';

export interface FindJobsBrowseProps {
  documentTitle: string;
  /** Job seeker flow: save applications from the detail dialog. Recruiter market browse omits this. */
  allowApply?: boolean;
}

export function FindJobsBrowse({ documentTitle, allowApply = false }: FindJobsBrowseProps) {
  const { language, tx } = useHireLanguage();
  const { filters, patch, clearFilters } = useFindJobsQuery();
  const { location } = useHomeState();
  const { isSaved, toggle } = useSavedJobs();
  const { applyFromListing } = useJobApplications();
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const lastLocation = useRef<string | null>(null);

  useEffect(() => {
    if (lastLocation.current === location) return;
    lastLocation.current = location;
    patch({ city: location, page: 1 });
  }, [location, patch]);

  const filtered = useMemo(() => {
    return sortFindJobs(filterFindJobs(FIND_JOBS_CATALOG, filters), filters.sort);
  }, [filters]);

  const totalJobs = filtered.length;
  const totalPages = totalFindJobPages(totalJobs, FIND_JOBS_PAGE_SIZE);
  const safePage = Math.min(filters.page, totalPages);
  const pageItems = paginateFindJobs(filtered, safePage, FIND_JOBS_PAGE_SIZE);
  const cityLabel = filters.city.trim() || 'Hyderabad';
  const rangeStart = totalJobs === 0 ? 0 : (safePage - 1) * FIND_JOBS_PAGE_SIZE + 1;
  const rangeEnd = Math.min(safePage * FIND_JOBS_PAGE_SIZE, totalJobs);

  return (
    <>
      <title>{documentTitle}</title>
      <FindJobsHero
        key={`${filters.role}|${filters.city}`}
        initialRole={filters.role}
        initialCity={filters.city}
        onSearch={(role, city) => patch({ role, city, page: 1 })}
      />
      <main id="main" className={cn(pageWrap, 'relative z-[4] pb-10 pt-4')}>
        <div className="grid items-start gap-5 min-[1024px]:grid-cols-[minmax(248px,288px)_minmax(0,1fr)] min-[1024px]:gap-6">
          <JobFiltersPanel filters={filters} onChange={patch} onClear={clearFilters} />
          <section
            aria-label={tx('Job results')}
            className="min-w-0 rounded-[18px] border border-line bg-surface p-4 shadow-card min-[768px]:p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <p className="text-[15px] font-extrabold text-ink">
                {language === 'hi' ? (
                  <>
                    <span className="text-brand-600">{cityLabel}</span>
                    {` में ${totalJobs} नौकरियाँ मिलीं`}
                  </>
                ) : (
                  <>
                    {`${totalJobs} jobs found in `}
                    <span className="text-brand-600">{cityLabel}</span>
                  </>
                )}
              </p>
              <div className="ml-auto flex shrink-0 items-center gap-2">
                <span className="text-[13px] font-semibold whitespace-nowrap text-ink-600">
                  {tx('Sort by')}:
                </span>
                <JobsSortMenu value={filters.sort} onChange={(sort) => patch({ sort, page: 1 })} />
              </div>
            </div>

            <ul className="mt-4 space-y-3">
              {pageItems.map((job: FindJobListing) => (
                <li key={job.id}>
                  <FindJobListCard
                    job={job}
                    saved={isSaved(job.id)}
                    onToggleSave={() => toggle(job.id)}
                    onView={() => setActiveJob(job)}
                  />
                </li>
              ))}
            </ul>

            {pageItems.length === 0 && (
              <p className="mt-6 rounded-2xl bg-canvas p-6 text-center text-sm font-semibold text-ink-500">
                {tx('No jobs match your filters. Try clearing filters or changing your search.')}
              </p>
            )}

            {totalJobs > 0 && (
              <div className="mt-5 flex flex-col gap-3 border-t border-line pt-4 min-[768px]:flex-row min-[768px]:items-center min-[768px]:justify-between min-[768px]:gap-6">
                <p className="shrink-0 text-[13px] font-semibold text-ink-600">
                  {jobsRangeLine(language, rangeStart, rangeEnd, totalJobs)}
                </p>
                <div className="min-w-0 min-[768px]:flex-1">
                  <FindJobsPagination
                    page={safePage}
                    totalPages={totalPages}
                    onPageChange={(page) => patch({ page })}
                    className="mt-0 justify-start border-0 pt-0 min-[768px]:justify-end"
                  />
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
      <FindJobsTrustBand />
      {allowApply ? (
        <FindJobsApplyLayer
          activeJob={activeJob}
          onClose={() => setActiveJob(null)}
          applyFromListing={applyFromListing}
        />
      ) : (
        <JobDialog job={activeJob} onClose={() => setActiveJob(null)} hideApply />
      )}
    </>
  );
}

function FindJobsApplyLayer({
  activeJob,
  onClose,
  applyFromListing
}: {
  activeJob: Job | null;
  onClose: () => void;
  applyFromListing: (job: FindJobListing) => void;
}) {
  const { session } = useJobSeekerSession();
  const [completeProfileForApply, setCompleteProfileForApply] = useState(false);
  const [pendingApply, setPendingApply] = useState<FindJobListing | null>(null);

  return (
    <>
      <JobDialog
        job={activeJob}
        onClose={onClose}
        onApply={(job) => {
          if (!isFindJobListing(job)) return;
          if (!canApplyWithProfile(session?.profileComplete ?? false, session?.candidate)) {
            setPendingApply(job);
            setCompleteProfileForApply(true);
            return false;
          }
          applyFromListing(job);
        }}
      />
      <JobSeekerIncompleteProfileDialog
        open={completeProfileForApply}
        onClose={() => {
          setCompleteProfileForApply(false);
          setPendingApply(null);
        }}
        onComplete={() => {
          if (pendingApply) applyFromListing(pendingApply);
          setPendingApply(null);
        }}
      />
    </>
  );
}
