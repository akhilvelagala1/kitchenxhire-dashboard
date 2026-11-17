import { jobLabelIcon } from './jobCategoryVisuals';
import { ReportCard } from './ReportCard';
import { ReportsRankList } from './ReportsRankList';
import { useReportsApplications } from './useReportsApplications';

/** The six job categories with the most applications received, each with its share of the total. */
export function ReportsApplicationsCategoriesCard() {
  const { data, isLoading, error, refetch } = useReportsApplications();
  const rows = data?.top_categories ?? [];

  return (
    <ReportCard
      title="Applications by Job Category"
      isLoading={isLoading}
      error={data ? undefined : error}
      onRetry={() => void refetch()}
      isEmpty={rows.length === 0}
      className="h-full min-h-0 lg:pr-[calc(11*var(--u))]"
    >
      <ReportsRankList
        variant="category"
        rows={rows}
        total={data?.kpis.total_applications.value ?? 0}
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
