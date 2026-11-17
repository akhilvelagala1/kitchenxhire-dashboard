import {
  ArrowDown,
  ArrowUp,
  Briefcase,
  CircleCheck,
  Hourglass,
  Users,
  X,
  type LucideIcon
} from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { Skeleton } from '@/shared/ui/Skeleton';
import { REPORT_RANGE_DAYS, type ReportKpi, type ReportKpiKey } from '../schemas/adminReports';
import { jobsCardClass } from './jobsCardStyles';
import { useReportsDrilldown } from './reportsDrilldownParams';
import { describeChange, formatCount } from './reportsFormat';
import { useReportRange } from './reportsPageParams';
import { useReportsOverview } from './useReportsOverview';

interface KpiDef {
  key: ReportKpiKey;
  label: string;
  icon: LucideIcon;
  /** The pastel square behind the icon, and the icon colour. */
  tile: string;
  format: (value: number) => string;
  /** Time to hire: a fall is the good direction, so it is drawn green. */
  lowerIsBetter?: boolean;
  /** The picture writes "vs previous N days" under the first two cards only. */
  caption?: boolean;
}

const KPI_DEFS: KpiDef[] = [
  {
    key: 'jobs_posted',
    label: 'Jobs Posted',
    icon: Briefcase,
    tile: 'bg-[#FFEDE6] text-brand-600',
    format: formatCount,
    caption: true
  },
  {
    key: 'applications',
    label: 'Applications',
    icon: Users,
    tile: 'bg-[#FFEDE6] text-brand-600',
    format: formatCount,
    caption: true
  },
  {
    key: 'hired',
    label: 'Hired',
    icon: CircleCheck,
    tile: 'bg-[#E7F8EC] text-[#16A34A]',
    format: formatCount
  },
  {
    key: 'rejected',
    label: 'Rejected',
    icon: X,
    tile: 'bg-[#FDE8E7] text-[#EF4444]',
    format: formatCount
  },
  {
    key: 'avg_time_to_hire_days',
    label: 'Avg. Time to Hire',
    icon: Hourglass,
    tile: 'bg-[#FFF3DC] text-[#F59E0B]',
    format: (days) => `${days.toFixed(1)} days`,
    lowerIsBetter: true
  }
];

/*
 * One white card, 95 design px tall, the same height while loading and on error so the rows below
 * never jump. It is a container: when the card is too narrow (a 1024px window), the icon square goes
 * so the number and its change still sit side by side.
 */
const FRAME = cn(
  jobsCardClass,
  '@container flex min-h-22 min-w-0 items-center gap-3 px-3 py-3 lg:h-[calc(95*var(--u))] lg:min-h-0 lg:gap-[calc(14*var(--u))] lg:px-[calc(12*var(--u))]'
);
const TILE =
  'flex size-12 shrink-0 items-center justify-center rounded-xl @max-[175px]:hidden lg:size-[calc(56*var(--u))] lg:rounded-[calc(14*var(--u))]';
/*
 * What turns the frame into a button: a full width (the container query has no width of its own),
 * the pointer, left-aligned text and the focus ring the module's other buttons draw.
 */
const CLICKABLE =
  'w-full cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600';
/** The open card: orange border and ring, no fill, no size change. `!` beats FRAME's border. */
const SELECTED = 'border-brand-600! ring-1 ring-brand-600';

interface KpiCardProps {
  def: KpiDef;
  kpi: ReportKpi;
  days: number;
  /** This card is the open one. */
  selected: boolean;
  onSelect: () => void;
}

/** A toggle button: it opens the records behind its number, and a second press closes them. */
function KpiCard({ def, kpi, days, selected, onSelect }: KpiCardProps) {
  const Icon = def.icon;
  const value = def.format(kpi.value);
  const { pct, direction } = describeChange(kpi.change_pct);
  const good = (direction === 'up') === !def.lowerIsBetter;
  const tone = direction === 'flat' ? 'text-[#475467]' : good ? 'text-[#0F7A3A]' : 'text-[#B42318]';
  const Arrow = direction === 'up' ? ArrowUp : ArrowDown;
  const sign = direction === 'up' ? '+' : direction === 'down' ? '-' : '';
  const spoken = direction === 'flat' ? 'unchanged' : `${direction} ${pct}%`;

  /* Only phrasing content may sit inside a button, so these are spans, not p and div. */
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={`${def.label}, ${value}, ${spoken} vs previous ${days} days`}
      onClick={onSelect}
      className={cn(FRAME, CLICKABLE, selected && SELECTED)}
    >
      <span className={cn(TILE, def.tile)}>
        <Icon aria-hidden className="size-6 lg:size-[calc(30*var(--u))]" strokeWidth={1.75} />
      </span>
      <span className="block min-w-0 flex-1 self-center lg:self-start">
        <span className="block truncate text-sm leading-[calc(18*var(--u))] font-medium text-[#475467]">
          {def.label}
        </span>
        <span className="flex flex-wrap items-center justify-between gap-x-[calc(6*var(--u))]">
          <span className="block text-2xl leading-[calc(30*var(--u))] font-bold text-[#101828]">
            {value}
          </span>
          <span
            className={cn(
              'inline-flex items-center gap-[calc(2*var(--u))] text-sm font-bold',
              tone
            )}
          >
            {direction !== 'flat' && <Arrow aria-hidden className="size-4" strokeWidth={2.5} />}
            {`${sign}${pct}%`}
          </span>
        </span>
        {def.caption && (
          <span className="block text-right text-xs leading-[calc(14*var(--u))] text-[#475467]">
            vs previous {days} days
          </span>
        )}
      </span>
    </button>
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

/**
 * The five stat cards of the Overview: Jobs Posted, Applications, Hired, Rejected and Avg. Time to
 * Hire, each with its change against the previous window of the same length. They read the shared
 * Overview request, so the numbers follow the date range in the URL. Each card is a button that
 * opens the detail behind its number (the `metric` URL parameter); pressing the open one closes it.
 */
export function ReportsKpiRow() {
  const { data, isLoading, error, refetch } = useReportsOverview();
  const days = REPORT_RANGE_DAYS[useReportRange()];
  const { metric, setMetric } = useReportsDrilldown();
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
        KPI_DEFS.map((def) => {
          const selected = def.key === metric;
          return (
            <KpiCard
              key={def.key}
              def={def}
              kpi={data.kpis[def.key]}
              days={days}
              selected={selected}
              onSelect={() => setMetric(selected ? null : def.key)}
            />
          );
        })}
    </div>
  );
}
