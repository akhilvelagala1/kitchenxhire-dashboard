import { BadgeCheck, Bookmark, Clock, IndianRupee, MapPin } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import type { FindJobListing } from '../schemas/findJobs';
import { JobCategoryIconBox } from './JobCategoryIconBox';
import { useHireLanguage } from '../hooks/useHireLanguage';
import { homeButton, pillBadge } from './styles';

const mutedIcon = 'size-[18px] flex-none text-ink-400';

interface FindJobListCardProps {
  job: FindJobListing;
  saved: boolean;
  onToggleSave: () => void;
  onView: () => void;
}

export function FindJobListCard({ job, saved, onToggleSave, onView }: FindJobListCardProps) {
  const { tx } = useHireLanguage();
  return (
    <article
      className={cn(
        'rounded-[18px] border border-line bg-surface px-4 py-3.5 shadow-card',
        'transition-shadow duration-200 hover:shadow-card-hover motion-reduce:transition-none min-[768px]:py-4'
      )}
    >
      <div className="flex flex-col gap-3 min-[1024px]:grid min-[1024px]:grid-cols-[56px_minmax(0,1.2fr)_minmax(0,0.85fr)_minmax(0,0.75fr)_auto] min-[1024px]:items-center min-[1024px]:gap-x-3 min-[1024px]:gap-y-0">
        <JobCategoryIconBox category={job.category} />

        <div className="min-w-0">
          <h3 className="text-[15px] font-extrabold tracking-[-0.02em] text-ink min-[768px]:text-base">
            {job.title}
          </h3>
          <p className="mt-0.5 flex flex-wrap items-center gap-1 text-[13px] font-semibold text-ink-500">
            {job.company}
            {job.verified && (
              <BadgeCheck className="size-4 text-brand-600" aria-label={tx('Verified employer')} />
            )}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-[13px] font-semibold text-ink-600">
            <MapPin className={mutedIcon} />
            <span className="truncate">{job.area}</span>
          </p>
        </div>

        <div className="flex items-start gap-2 text-[13px] font-semibold leading-snug text-ink-600 min-[1024px]:items-center">
          <Clock className={cn(mutedIcon, 'mt-0.5 min-[1024px]:mt-0')} />
          <span>{job.shift}</span>
        </div>

        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[14px] font-extrabold text-ink">
            <IndianRupee className={cn(mutedIcon, 'text-ink-500')} />
            {job.pay}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 min-[1024px]:min-w-[148px] min-[1024px]:flex-col min-[1024px]:items-end min-[1024px]:gap-2">
          <div className="flex items-center gap-2 min-[1024px]:flex-row-reverse">
            <button
              type="button"
              aria-label={saved ? tx('Remove saved job') : tx('Save job')}
              aria-pressed={saved}
              onClick={onToggleSave}
              className="grid size-9 place-items-center rounded-full text-brand-600 hover:bg-brand-50"
            >
              <Bookmark className={cn('size-[18px]', saved && 'fill-brand-600')} />
            </button>
            <span className={pillBadge}>{tx(job.type)}</span>
          </div>
          <button type="button" onClick={onView} className={homeButton('orange-slim')}>
            {tx('View Job →')}
          </button>
        </div>
      </div>
    </article>
  );
}
