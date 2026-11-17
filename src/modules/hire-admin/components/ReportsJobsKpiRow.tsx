import { ArrowDown, ArrowUp, Briefcase, CircleCheck, FileText, Hourglass, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { Skeleton } from '@/shared/ui/Skeleton';
import { REPORT_RANGE_DAYS, type JobsReportKpiKey } from '../schemas/adminReports';
import { jobsCardClass } from './jobsCardStyles';
import { formatCount } from './reportsFormat';
import { useReportRange } from './reportsPageParams';
import { useReportsJobs } from './useReportsJobs';

interface KpiDef {
  key: JobsReportKpiKey;
  label: string;
  icon: LucideIcon;
  tile: string;
  format: (value: number) => string;
  lowerIsBetter?: boolean;
  caption?: boolean;
}

const KPI_DEFS: KpiDef[] = [
  {
    key: 'total_jobs',
    label: 'Total Jobs',
    icon: Briefcase,
    tile: 'bg-[#FFEDE6] text-brand-600',
    format: formatCount,
    caption: true
  },
  {
    key: 'active',
    label: 'Active',
    icon: CircleCheck,
    tile: 'bg-[#E7F8EC] text-[#16A34A]',
    format: formatCount,
    caption: true
  },
  {
    key: 'closed',
    label: 'Closed',
    icon: X,
    tile: 'bg-[#FDE8E7] text-[#EF4444]',
    format: formatCount
  },
  {
    key: 'draft',
    label: 'Draft',
    icon: FileText,
    tile: 'bg-[#EDE4FF] text-[#7C3AED]',
    format: formatCount
  },
  {
    key: 'avg_time_to_fill_days',
    label: 'Avg. Time to Fill',
    icon: Hourglass,
    tile: 'bg-[#FFF3DC] text-[#F59E0B]',
    format: (days) => `${days.toFixed(1)} days`,
    lowerIsBetter: true
  }
];

/* Same frame as the Overview KPI row, so the two tabs' cards are always the same size (UI-14). */
const FRAME = cn(
  jobsCardClass,
  '@container flex min-h-22 min-w-0 items-center gap-3 px-3 py-3 lg:h-[calc(95*var(--u))] lg:min-h-0 lg:gap-[calc(14*var(--u))] lg:px-[calc(12*var(--u))]'
);
const TILE =
  'flex size-12 shrink-0 items-center justify-center rounded-xl @max-[175px]:hidden lg:size-[calc(56*var(--u))] lg:rounded-[calc(14*var(--u))]';

function describeChange(change: number) {
  const pct = Math.round(Math.abs(change) * 10) / 10;
  const direction = pct === 0 ? 'flat' : change > 0 ? 'up' : 'down';
  return { pct, direction } as const;
}

function KpiCard({
  def,
  kpi,
  days
}: {
  def: KpiDef;
  kpi: { value: number; change_pct: number };
  days: number;
}) {
  const Icon = def.icon;
  const value = def.format(kpi.value);
  const { pct, direction } = describeChange(kpi.change_pct);
  const good = (direction === 'up') === !def.lowerIsBetter;
  const tone = direction === 'flat' ? 'text-[#475467]' : good ? 'text-[#0F7A3A]' : 'text-[#B42318]';
  const Arrow = direction === 'up' ? ArrowUp : ArrowDown;
  const sign = direction === 'up' ? '+' : direction === 'down' ? '-' : '';
  const spoken = direction === 'flat' ? 'unchanged' : `${direction} ${pct}%`;

  return (
    <div
      role="group"
      aria-label={`${def.label}, ${value}, ${spoken} vs previous ${days} days`}
      className={FRAME}
    >
      <span className={cn(TILE, def.tile)}>
        <Icon aria-hidden className="size-6 lg:size-[calc(30*var(--u))]" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1 self-center lg:self-start">
        <p className="truncate text-sm leading-[calc(18*var(--u))] font-medium text-[#475467]">
          {def.label}
        </p>
        <div className="flex flex-wrap items-center justify-between gap-x-[calc(6*var(--u))]">
          <p className="text-2xl leading-[calc(30*var(--u))] font-bold text-[#101828]">{value}</p>
          <span
            className={cn(
              'inline-flex items-center gap-[calc(2*var(--u))] text-sm font-bold',
              tone
            )}
          >
            {direction !== 'flat' && <Arrow aria-hidden className="size-4" strokeWidth={2.5} />}
            {`${sign}${pct}%`}
          </span>
        </div>
        {def.caption && (
          <p className="text-right text-xs leading-[calc(14*var(--u))] text-[#475467]">
            vs previous {days} days
          </p>
        )}
      </div>
    </div>
  );
}

function KpiSkeleton() {
  return (
    <div className={FRAME}>
      <Skeleton className="size-12 shrink-0 rounded-xl lg:size-[calc(56*var(--u))]" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-6 w-20" />
      </div>
    </div>
  );
}

/** The five stat cards of the Jobs Report: Total Jobs, Active, Closed, Draft and Avg. Time to Fill. */
export function ReportsJobsKpiRow() {
  const { data, isLoading, error, refetch } = useReportsJobs();
  const days = REPORT_RANGE_DAYS[useReportRange()];
  const failed = Boolean(error) && !data;

  return (
    <div
      className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:gap-[calc(14*var(--u))]"
      aria-busy={isLoading || undefined}
    >
      {isLoading && (
        <>
          <span role="status" className="sr-only">
            Loading report figures
          </span>
          {KPI_DEFS.map((def) => (
            <KpiSkeleton key={def.key} />
          ))}
        </>
      )}
      {failed && !isLoading && (
        <div
          role="alert"
          className={cn(
            FRAME,
            'col-span-full flex-wrap justify-center text-sm text-[#475467] lg:text-[calc(14*var(--u))]'
          )}
        >
          <span>Could not load the report figures.</span>
          <Button variant="secondary" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      )}
      {data &&
        KPI_DEFS.map((def) => (
          <KpiCard key={def.key} def={def} kpi={data.kpis[def.key]} days={days} />
        ))}
    </div>
  );
}
