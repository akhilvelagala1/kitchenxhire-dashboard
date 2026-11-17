import { Briefcase, Calendar, IndianRupee, MapPin } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { formatAppliedDate } from '../lib/jobApplications';
import type { JobApplication } from '../schemas/jobApplication';
import { ApplicationStatusBadge } from './ApplicationStatusBadge';
import { JobCategoryIconBox } from './JobCategoryIconBox';
import { homeButton } from './styles';

const mutedIcon = 'size-3.5 flex-none text-ink-400';

const metaText =
  'flex min-w-0 items-center gap-1.5 text-[12px] font-semibold leading-snug text-ink-600';

interface ApplicationListCardProps {
  application: JobApplication;
  selected: boolean;
  onSelect: () => void;
  onViewDetails: () => void;
}

/**
 * Dense multi-column card. Identity (icon + title block) is one flex group so the
 * logo never shares a skinny grid track that it can overflow into the job title.
 */
export function ApplicationListCard({
  application,
  selected,
  onSelect,
  onViewDetails
}: ApplicationListCardProps) {
  function onCardKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect();
    }
  }

  return (
    <article
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={onSelect}
      onKeyDown={onCardKeyDown}
      className={cn(
        'w-full cursor-pointer rounded-[12px] border border-line bg-surface px-3 py-2 text-left shadow-card',
        'transition-[background-color,box-shadow,border-color] duration-200 motion-reduce:transition-none',
        'hover:border-brand-200/50 hover:bg-[#FFFAF7] hover:shadow-card-hover',
        selected && 'border-brand-200/60 bg-[#FFFAF7] shadow-card-hover',
        'min-[1024px]:px-3.5 min-[1024px]:py-2'
      )}
    >
      <div
        className={cn(
          'flex w-full flex-col gap-2.5',
          'min-[1024px]:grid min-[1024px]:w-full min-[1024px]:items-center min-[1024px]:gap-x-3 min-[1024px]:gap-y-0',
          'min-[1024px]:grid-cols-[minmax(0,1.35fr)_minmax(0,0.88fr)_minmax(0,0.78fr)_minmax(0,0.88fr)_auto]'
        )}
      >
        <div className="flex min-w-0 items-center gap-3.5">
          <JobCategoryIconBox category={application.category} size="sm" />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-[14px] font-extrabold leading-tight tracking-[-0.02em] text-ink min-[1280px]:text-[15px]">
              {application.title}
            </h3>
            <p className="mt-0.5 truncate text-[12px] font-semibold text-ink-500">
              {application.company}
            </p>
            <p className="mt-0.5 flex min-w-0 items-center gap-1 text-[12px] font-semibold text-ink-600">
              <MapPin className={mutedIcon} aria-hidden="true" />
              <span className="truncate">{application.area}</span>
            </p>
          </div>
        </div>

        <div
          className={cn(
            metaText,
            'min-[1024px]:border-l min-[1024px]:border-line min-[1024px]:pl-2.5'
          )}
        >
          <Calendar className={mutedIcon} aria-hidden="true" />
          <span className="min-w-0">Applied on {formatAppliedDate(application.appliedAt)}</span>
        </div>

        <div
          className={cn(
            metaText,
            'min-[1024px]:border-l min-[1024px]:border-line min-[1024px]:pl-2.5'
          )}
        >
          <Briefcase className={mutedIcon} aria-hidden="true" />
          <span className="min-w-0 line-clamp-2">{application.shift}</span>
        </div>

        <div
          className={cn(
            metaText,
            'font-extrabold text-ink min-[1024px]:border-l min-[1024px]:border-line min-[1024px]:pl-2.5'
          )}
        >
          <IndianRupee className={cn(mutedIcon, 'text-ink-500')} aria-hidden="true" />
          <span className="min-w-0 line-clamp-2">{application.pay}</span>
        </div>

        <div
          className="flex shrink-0 flex-row flex-wrap items-center gap-1.5 min-[1024px]:flex-col min-[1024px]:items-end min-[1024px]:justify-self-end min-[1024px]:gap-1"
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <ApplicationStatusBadge status={application.status} />
          <button
            type="button"
            onClick={() => {
              onSelect();
              onViewDetails();
            }}
            className={homeButton('orange-header')}
          >
            View Details →
          </button>
        </div>
      </div>
    </article>
  );
}
