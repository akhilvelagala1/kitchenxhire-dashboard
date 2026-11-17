import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import type { HireJobStatus } from '../schemas/adminJob';
import type { JobStatusCount } from '../schemas/adminReports';
import { hireJobStatusLabel } from './hireJobStatusBadgeClasses';
import { ReportCard } from './ReportCard';
import { formatCount, formatShare } from './reportsFormat';
import { useReportsJobs } from './useReportsJobs';

/** Solid fills for the donut slices; the dot in the list uses the same colour. */
const STATUS_COLOR: Record<HireJobStatus, string> = {
  active: '#16A34A',
  under_review: '#F5AE32',
  paused: '#64748B',
  closed: '#EF4444',
  draft: '#7C3AED'
};

interface StatusProps {
  rows: JobStatusCount[];
  total: number;
}

/** The ring is 36% of the radius thick: 35u of 96u in the reference. */
function StatusDonut({ rows, total }: StatusProps) {
  // A status with no jobs has no slice, but it keeps its row in the list.
  const slices = rows.filter((row) => row.count > 0);

  return (
    <div className="relative size-48 shrink-0 lg:size-[min(calc(193*var(--u)),40cqw)]">
      <div
        role="img"
        aria-label={`Donut chart of ${formatCount(total)} jobs split by status`}
        className="absolute inset-0"
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <Pie
              data={slices}
              dataKey="count"
              nameKey="status"
              startAngle={90}
              endAngle={-270}
              innerRadius="64%"
              outerRadius="100%"
              paddingAngle={2}
              stroke="none"
              isAnimationActive={false}
            >
              {slices.map((slice) => (
                <Cell key={slice.status} fill={STATUS_COLOR[slice.status]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl leading-none font-bold text-[#101828] lg:text-[calc(28*var(--u))]">
          {formatCount(total)}
        </span>
        <span className="mt-1 text-sm text-[#475467] lg:mt-[calc(4*var(--u))] lg:text-[calc(14*var(--u))]">
          Total Jobs
        </span>
      </div>
    </div>
  );
}

/** One grid for the rows, so the counts and the shares line up whatever their width. */
function StatusList({ rows, total }: StatusProps) {
  return (
    <ul className="grid w-full max-w-sm grid-cols-[auto_minmax(0,1fr)_auto_auto] gap-x-1 lg:max-w-none lg:min-w-0 lg:flex-1 lg:gap-x-[calc(4*var(--u))]">
      {rows.map((row) => (
        <li
          key={row.status}
          className="col-span-4 grid grid-cols-subgrid items-center py-1.5 text-base text-[#101828] lg:min-h-[calc(38*var(--u))] lg:py-0 lg:text-[calc(16*var(--u))]"
        >
          <span
            aria-hidden="true"
            className="size-3.5 shrink-0 rounded-full lg:size-[calc(14*var(--u))]"
            style={{ backgroundColor: STATUS_COLOR[row.status] }}
          />
          <span className="pl-1.5 font-medium whitespace-nowrap lg:pl-[calc(6*var(--u))]">
            {hireJobStatusLabel(row.status)}
          </span>
          <span className="text-right font-bold tabular-nums">{formatCount(row.count)}</span>
          <span className="pl-1.5 text-[#667085] tabular-nums lg:pl-[calc(6*var(--u))]">
            ({formatShare(row.count, total)})
          </span>
        </li>
      ))}
    </ul>
  );
}

/** How the window's jobs split across their statuses: a donut and a list with shares. */
export function ReportsJobsStatusCard() {
  const { data, isLoading, error, refetch } = useReportsJobs();
  const rows = data?.jobs_status ?? [];
  const total = rows.reduce((sum, row) => sum + row.count, 0);

  return (
    <ReportCard
      title="Jobs by Status"
      isLoading={isLoading}
      error={data ? undefined : error}
      onRetry={() => void refetch()}
      isEmpty={total === 0}
      className="h-full min-h-0"
    >
      <div className="@container flex min-h-0 flex-1 flex-col items-center justify-center gap-5 lg:flex-row lg:justify-start lg:gap-[calc(24*var(--u))]">
        <StatusDonut rows={rows} total={total} />
        <StatusList rows={rows} total={total} />
      </div>
    </ReportCard>
  );
}
