import { ArrowRight, Clock, House, IndianRupee, MapPin } from 'lucide-react';
import type { KeyboardEvent } from 'react';
import { cn } from '@/shared/lib/cn';
import type { Job } from '../schemas/home';
import { useHireLanguage } from '../hooks/useHireLanguage';
import { card, metaGrid, metaItem, pillBadge } from './styles';

const iconClass = 'size-4 flex-none text-ink-400';

export interface JobCardProps {
  job: Job;
  className?: string;
  onOpen: (job: Job) => void;
}

/** The whole card is the interactive surface — one handler, no nested button. */
export function JobCard({ job, className, onOpen }: JobCardProps) {
  const { tx } = useHireLanguage();

  function open() {
    onOpen(job);
  }

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      open();
    }
  }

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={onKeyDown}
      aria-label={`${tx('View Job')}: ${tx(job.title)}`}
      className={cn(
        card,
        'flex cursor-pointer flex-col border border-line/60 px-4 pt-3.5 pb-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-extrabold tracking-[-0.02em] text-ink">{tx(job.title)}</h3>
        <span className={pillBadge}>{tx(job.type)}</span>
      </div>
      <div className={cn(metaGrid, 'mt-2.5')}>
        <span className={metaItem}>
          <House className={iconClass} />
          {tx(job.place)}
        </span>
        <span className={metaItem}>
          <MapPin className={iconClass} />
          {job.area}
        </span>
        <span className={metaItem}>
          <Clock className={iconClass} />
          {job.shift}
        </span>
        <span className={metaItem}>
          <IndianRupee className={iconClass} />
          {job.pay}
        </span>
      </div>
      <span
        aria-hidden="true"
        className="mt-3 inline-flex items-center gap-1.5 self-start text-[14px] font-extrabold text-brand-600"
      >
        {tx('View Job')}
        <ArrowRight className="size-3.5 stroke-[2.4]" />
      </span>
    </article>
  );
}
