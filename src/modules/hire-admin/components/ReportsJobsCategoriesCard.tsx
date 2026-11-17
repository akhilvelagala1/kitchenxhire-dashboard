import { jobLabelIcon } from './jobCategoryVisuals';
import { ReportCard } from './ReportCard';
import { ReportsRankList } from './ReportsRankList';
import { useReportsJobs } from './useReportsJobs';

/** The six job categories with the most jobs posted, each with its share of total jobs. */
export function ReportsJobsCategoriesCard() {
  const { data, isLoading, error, refetch } = useReportsJobs();
  const rows = data?.top_categories ?? [];

  return (
    <ReportCard
      title="Top Job Categories"
      isLoading={isLoading}
      error={data ? undefined : error}
      onRetry={() => void refetch()}
      isEmpty={rows.length === 0}
      className="h-full min-h-0 lg:pr-[calc(11*var(--u))]"
    >
      <ReportsRankList
        variant="category"
        rows={rows}
        total={data?.kpis.total_jobs.value ?? 0}
        renderIcon={(label) => {
          const Icon = jobLabelIcon(label);
          return (
            <Icon
              aria-hidden
              className="size-5 shrink-0 text-[#FF4B16] lg:size-[calc(22*var(--u))]"
            />
          );
        }}
      />
    </ReportCard>
  );
}
