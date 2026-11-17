import { Bookmark, MapPin } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { categoryLabel, type SavedJobListing } from '../lib/savedJobs';
import { JobCategoryIconBox } from './JobCategoryIconBox';
import { homeButton, pillBadge } from './styles';

interface SavedJobCardProps {
  job: SavedJobListing;
  onUnsave: () => void;
  onApply: () => void;
}

export function SavedJobCard({ job, onUnsave, onApply }: SavedJobCardProps) {
  return (
    <article className="rounded-[16px] border border-line bg-surface px-4 py-3.5 shadow-card min-[1024px]:px-5">
      <div className="flex flex-col gap-3 min-[768px]:flex-row min-[768px]:items-center min-[768px]:gap-4">
        <JobCategoryIconBox category={job.category} />

        <div className="min-w-0 flex-1">
          <h3 className="text-[16px] font-extrabold tracking-[-0.02em] text-ink">{job.title}</h3>
          <p className="mt-0.5 text-[13.5px] font-semibold text-ink-500">
            {job.company}
            <span className="text-ink-400"> · </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5 text-ink-400" aria-hidden="true" />
              {job.area}
            </span>
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className={pillBadge}>{categoryLabel(job.category)}</span>
            <span className={cn(pillBadge, 'bg-emerald-50 text-emerald-700 ring-0')}>
              {job.type}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 min-[768px]:flex-col min-[768px]:items-end">
          <p className="text-[14px] font-extrabold text-ink">{job.pay}</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Remove saved job"
              aria-pressed
              onClick={onUnsave}
              className="grid size-9 place-items-center rounded-full text-brand-600 hover:bg-brand-50"
            >
              <Bookmark className="size-[18px] fill-brand-600" />
            </button>
            <button type="button" onClick={onApply} className={homeButton('orange-slim')}>
              Apply
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
