import { useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { JobsPageHeaderSection } from '../components/JobsPageHeaderSection';
import { JobsTableSection } from '../components/JobsTableSection';
import { parseJobsSearchParams } from '../components/jobsPageParams';
import type { JobsDateRangePreset } from '../schemas/adminJob';

/**
 * Jobs list redesign: heading (range + Post a Job) plus the management card.
 * KPI cards, trend chart, Quick Actions and Jobs-by-Category were removed.
 */
export function AdminJobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const p = useMemo(() => parseJobsSearchParams(searchParams), [searchParams]);

  function setRange(r: JobsDateRangePreset) {
    const next = new URLSearchParams(searchParams);
    next.set('range', r);
    next.delete('page');
    if (r !== 'custom') {
      next.delete('from');
      next.delete('to');
    }
    setSearchParams(next, { replace: true });
  }

  function setDateRange(from: string | undefined, to: string | undefined) {
    const next = new URLSearchParams(searchParams);
    if (from) next.set('from', from);
    else next.delete('from');
    if (to) next.set('to', to);
    else next.delete('to');
    next.delete('page');
    setSearchParams(next, { replace: true });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 p-4">
      <JobsPageHeaderSection
        range={p.range}
        from={p.from}
        to={p.to}
        onRangeChange={setRange}
        onDateRangeChange={setDateRange}
      />
      <JobsTableSection />
    </div>
  );
}
