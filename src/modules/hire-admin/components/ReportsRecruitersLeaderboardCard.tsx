import { User } from 'lucide-react';
import { ReportCard } from './ReportCard';
import { ReportsRankList } from './ReportsRankList';
import { useReportsRecruiters } from './useReportsRecruiters';

/** The five recruiters with the most hires in the window, each with its share of all hires. */
export function ReportsRecruitersLeaderboardCard() {
  const { data, isLoading, error, refetch } = useReportsRecruiters();
  const rows = data?.top_recruiters ?? [];
  const total = data?.recruiter_activity.at(-1)?.hires ?? 0;

  return (
    <ReportCard
      title="Top Recruiters by Hires"
      isLoading={isLoading}
      error={data ? undefined : error}
      onRetry={() => void refetch()}
      isEmpty={rows.length === 0}
      className="h-full min-h-0 lg:pr-[calc(11*var(--u))]"
    >
      <ReportsRankList
        variant="category"
        rows={rows}
        total={total}
        renderIcon={() => (
          <User
            aria-hidden
            className="size-5 shrink-0 text-[#FF4B16] lg:size-[calc(22*var(--u))]"
          />
        )}
      />
    </ReportCard>
  );
}
