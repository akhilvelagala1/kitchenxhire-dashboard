import { Bookmark } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import type { ApplicationStatus } from '../schemas/jobApplication';
import { APPLICATION_STATUS_LABEL } from '../schemas/jobApplication';
import type { MyApplicationsTab } from '../schemas/savedJobs';

interface ApplicationFilterPillsProps {
  active: MyApplicationsTab;
  total: number;
  byStatus: Record<ApplicationStatus, number>;
  savedCount: number;
  onChange: (filter: MyApplicationsTab) => void;
}

const STATUS_FILTERS: { id: Exclude<MyApplicationsTab, 'saved'>; label: string }[] = [
  { id: 'all', label: 'All Applications' },
  { id: 'under-review', label: APPLICATION_STATUS_LABEL['under-review'] },
  { id: 'shortlisted', label: APPLICATION_STATUS_LABEL.shortlisted },
  { id: 'interview', label: APPLICATION_STATUS_LABEL.interview },
  { id: 'selected', label: APPLICATION_STATUS_LABEL.selected },
  { id: 'closed', label: APPLICATION_STATUS_LABEL.closed }
];

const pillClass = (active: boolean) =>
  cn(
    'inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[13px] font-extrabold transition-colors',
    active
      ? 'bg-brand-600 text-white shadow-btn-orange-slim'
      : 'border border-line bg-surface text-ink-700 hover:bg-muted'
  );

export function ApplicationFilterPills({
  active,
  total,
  byStatus,
  savedCount,
  onChange
}: ApplicationFilterPillsProps) {
  function countFor(id: Exclude<MyApplicationsTab, 'saved'>): number {
    return id === 'all' ? total : byStatus[id];
  }

  return (
    <div className="flex flex-wrap gap-2">
      {STATUS_FILTERS.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          aria-pressed={active === id}
          onClick={() => onChange(id)}
          className={pillClass(active === id)}
        >
          {label} ({countFor(id)})
        </button>
      ))}
      <button
        type="button"
        aria-pressed={active === 'saved'}
        onClick={() => onChange('saved')}
        className={pillClass(active === 'saved')}
      >
        <Bookmark
          className={cn('size-3.5', active === 'saved' && 'fill-white')}
          aria-hidden="true"
        />
        Saved Jobs ({savedCount})
      </button>
    </div>
  );
}
