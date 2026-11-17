import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { cn } from '@/shared/lib/cn';
import type { RecruiterStatus } from '../schemas/adminRecruiter';
import type { RecruiterStatusCount } from '../schemas/adminReports';
import { ReportCard } from './ReportCard';
import { formatCount, formatShare } from './reportsFormat';
import { useReportsRecruiters } from './useReportsRecruiters';

const STATUS_STYLE: Record<RecruiterStatus, { label: string; color: string; dotClass: string }> = {
  active: { label: 'Active', color: '#16A34A', dotClass: 'bg-[#16A34A]' },
  inactive: { label: 'Inactive', color: '#2688F5', dotClass: 'bg-[#2688F5]' },
  suspended: { label: 'Suspended', color: '#F5AE32', dotClass: 'bg-[#F5AE32]' },
  pending: { label: 'Pending', color: '#EF4444', dotClass: 'bg-[#EF4444]' }
};

interface StatusProps {
  rows: RecruiterStatusCount[];
  total: number;
}

/** The ring is 36% of the radius thick: 35u of 96u in the reference. */
function StatusDonut({ rows, total }: StatusProps) {
  // A status with no recruiters has no slice, but it keeps its row in the list.
  const slices = rows
    .filter((row) => row.count > 0)
    .map((row) => ({ ...row, ...STATUS_STYLE[row.status] }));

  return (
    <div className="relative size-48 shrink-0 lg:size-[min(calc(193*var(--u)),40cqw)]">
      <div
        role="img"
        aria-label={`Donut chart of ${formatCount(total)} recruiters split by status`}
        className="absolute inset-0"
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <Pie
              data={slices}
              dataKey="count"
              nameKey="label"
              startAngle={90}
              endAngle={-270}
              innerRadius="64%"
              outerRadius="100%"
              paddingAngle={2}
              stroke="none"
              isAnimationActive={false}
            >
              {slices.map((slice) => (
                <Cell key={slice.status} fill={slice.color} />
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
          Recruiters
        </span>
      </div>
    </div>
  );
}

/** One grid for the four rows, so the counts and the shares line up whatever their width. */
function StatusList({ rows, total }: StatusProps) {
  return (
    <ul className="grid w-full max-w-sm grid-cols-[auto_minmax(0,1fr)_auto_auto] gap-x-1 lg:max-w-none lg:min-w-0 lg:flex-1 lg:gap-x-[calc(4*var(--u))]">
      {rows.map((row) => {
        const style = STATUS_STYLE[row.status];
        return (
          <li
            key={row.status}
            className="col-span-4 grid grid-cols-subgrid items-center py-1.5 text-base text-[#101828] lg:min-h-[calc(38*var(--u))] lg:py-0 lg:text-[calc(16*var(--u))]"
          >
            <span
              aria-hidden="true"
              className={cn('size-3.5 rounded-full lg:size-[calc(14*var(--u))]', style.dotClass)}
            />
            <span className="pl-1.5 font-medium whitespace-nowrap lg:pl-[calc(6*var(--u))]">
              {style.label}
            </span>
            <span className="text-right font-bold tabular-nums">{formatCount(row.count)}</span>
            <span className="pl-1.5 text-[#667085] tabular-nums lg:pl-[calc(6*var(--u))]">
              ({formatShare(row.count, total)})
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/** How the platform's recruiters split across the four statuses: a donut and a list with shares. */
export function ReportsRecruitersStatusCard() {
  const { data, isLoading, error, refetch } = useReportsRecruiters();
  const rows = data?.recruiter_status ?? [];
  const total = rows.reduce((sum, row) => sum + row.count, 0);

  return (
    <ReportCard
      title="Recruiters by Status"
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
