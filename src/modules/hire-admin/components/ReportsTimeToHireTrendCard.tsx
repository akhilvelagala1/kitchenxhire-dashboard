import { ArrowDown, ArrowUp } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { REPORT_RANGE_DAYS } from '../schemas/adminReports';
import { ReportCard } from './ReportCard';
import { ReportsTimeToHireChart } from './ReportsTimeToHireChart';
import { describeChange, formatDays } from './reportsFormat';
import { useReportRange } from './reportsPageParams';
import { useReportsTimeToHire } from './useReportsDrilldownData';

const NOTE =
  'inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-sm lg:mt-[calc(1*var(--u))] lg:gap-[calc(5*var(--u))] lg:rounded-[calc(10*var(--u))] lg:px-[calc(12*var(--u))] lg:py-[calc(7*var(--u))] lg:text-[calc(14*var(--u))]';

/** Lower is better for time to hire, so a fall is the green pill and a rise the red one, as on the stat cards. */
const TONES = {
  down: 'bg-[#E7F8EC] text-[#0F7A3A]',
  up: 'bg-[#FDE8E7] text-[#B42318]',
  flat: 'bg-[#F2F4F7] text-[#475467]'
};

/** The change against the previous window. With nothing to compare with it is a plain dash, not a pill. */
function ChangeNote({ change, days }: { change: number | null; days: number }) {
  const caption = `vs previous ${days} days`;
  if (change === null) {
    return (
      <span
        title={`No hires in the previous ${days} days to compare with`}
        className={cn(NOTE, 'font-medium text-[#667085]')}
      >
        {`— ${caption}`}
      </span>
    );
  }
  const { pct, direction } = describeChange(change);
  const Arrow = direction === 'up' ? ArrowUp : ArrowDown;
  const sign = direction === 'up' ? '+' : direction === 'down' ? '-' : '';
  return (
    <span className={cn(NOTE, TONES[direction])}>
      {direction !== 'flat' && (
        <Arrow aria-hidden className="size-4 lg:size-[calc(16*var(--u))]" strokeWidth={2.5} />
      )}
      <span className="font-bold">{`${sign}${pct}%`}</span>{' '}
      <span className="font-medium">{caption}</span>
    </span>
  );
}

/** How the average time to hire moved over the chosen range: one smooth orange line with its last value tagged. */
export function ReportsTimeToHireTrendCard() {
  const { data, isLoading, error, refetch } = useReportsTimeToHire();
  const days = REPORT_RANGE_DAYS[useReportRange()];
  const points = data?.trend ?? [];
  const hasLine = points.some((point) => point.average_days !== null);

  return (
    <ReportCard
      title={
        data ? `Average Time to Hire: ${formatDays(data.average_days)}` : 'Average Time to Hire'
      }
      subtitle="Average number of days from application to hire."
      aside={
        data && data.average_days !== null ? (
          <ChangeNote change={data.change_pct} days={days} />
        ) : undefined
      }
      isLoading={isLoading}
      error={data ? undefined : error}
      onRetry={() => void refetch()}
      isEmpty={data?.hires_counted === 0 || !hasLine}
      className="h-full min-h-0"
    >
      <ReportsTimeToHireChart points={points} />
    </ReportCard>
  );
}
