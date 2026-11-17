import { useState } from 'react';
import type { Job } from '../schemas/home';
import { JobCard } from './JobCard';
import { JobDialog } from './JobDialog';
import { Reveal } from './Reveal';
import { useHireLanguage } from '../hooks/useHireLanguage';
import { kicker, pageWrap, secTitle } from './styles';

/** Cards shown before "View All Jobs" is pressed. */
const INITIAL_VISIBLE = 6;

export interface RecentJobsProps {
  jobs: Job[];
  /** Shown instead of the cards when the search matches nothing. */
  emptyMessage: string;
}

export function RecentJobs({ jobs, emptyMessage }: RecentJobsProps) {
  const { tx } = useHireLanguage();
  const [selected, setSelected] = useState<Job | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [trackedJobs, setTrackedJobs] = useState(jobs);

  if (jobs !== trackedJobs) {
    setTrackedJobs(jobs);
    setExpanded(false);
  }

  const hasMore = jobs.length > INITIAL_VISIBLE;
  const visibleJobs = expanded ? jobs : jobs.slice(0, INITIAL_VISIBLE);

  return (
    <section id="jobs" className="scroll-mt-[84px] pt-14 pb-8">
      <div className={pageWrap}>
        <div className="flex items-start justify-between gap-3 min-[480px]:items-end min-[720px]:gap-4">
          <div className="min-w-0">
            <p className={kicker}>{tx('Recent opportunities')}</p>
            <h2 className={secTitle}>{tx('Recently posted jobs.')}</h2>
          </div>
          {hasMore && (
            <button
              type="button"
              onClick={() => setExpanded((current) => !current)}
              className="group shrink-0 inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg text-xs font-extrabold text-brand-600 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 min-[380px]:text-sm"
            >
              {expanded ? tx('View Less') : tx('View All Jobs →')}
            </button>
          )}
        </div>
        <Reveal className="mt-7 grid items-stretch gap-3.5 min-[720px]:grid-cols-2">
          {visibleJobs.map((job, index) => (
            <JobCard
              key={job.id}
              job={job}
              className={index >= 2 ? 'hidden min-[720px]:flex' : undefined}
              onOpen={setSelected}
            />
          ))}
        </Reveal>
        {jobs.length === 0 && (
          <p className="mt-4 rounded-[22px] border border-line bg-surface px-5 py-7 text-center font-semibold text-ink-500 shadow-card">
            {emptyMessage}
          </p>
        )}
      </div>
      <JobDialog job={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
