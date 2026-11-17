import { jobLabelIcon } from './jobCategoryVisuals';
import { ReportCard } from './ReportCard';
import { formatDays } from './reportsFormat';
import { useReportsTimeToHire } from './useReportsDrilldownData';

/**
 * A row is two chips side by side, as in the picture: the category on a very light peach that gets
 * lighter to the right, and its value on a light grey of the same height. Rows share the height the
 * card leaves and stop at 47u, so a tall card shows them at their size with room below; below lg they
 * keep a comfortable 44px.
 */
const ROW =
  'flex min-h-11 items-stretch gap-1 text-sm lg:max-h-[calc(47*var(--u))] lg:min-h-0 lg:flex-1 lg:gap-[calc(4*var(--u))] lg:text-[calc(14*var(--u))]';
const CATEGORY_CHIP =
  'flex min-w-0 flex-1 items-center gap-3 rounded-xl bg-linear-to-r from-brand-50 to-brand-25 px-3 lg:gap-[calc(9*var(--u))] lg:rounded-[calc(12*var(--u))] lg:px-[calc(14*var(--u))]';
const VALUE_CHIP =
  'flex min-w-24 items-center justify-end rounded-xl bg-[#F8F9FC] px-3 font-bold whitespace-nowrap text-[#101828] tabular-nums lg:min-w-[calc(100*var(--u))] lg:rounded-[calc(12*var(--u))] lg:px-[calc(14*var(--u))]';

/** The average days from application to hire for each job category, in the order the API sends them. */
export function ReportsTimeToHireCategoriesCard() {
  const { data, isLoading, error, refetch } = useReportsTimeToHire();
  const rows = data?.by_category ?? [];

  return (
    <ReportCard
      title="Time to Hire – by Job Category"
      isLoading={isLoading}
      error={data ? undefined : error}
      onRetry={() => void refetch()}
      isEmpty={rows.length === 0}
      className="h-full min-h-0"
    >
      <ul className="flex min-h-0 flex-1 flex-col gap-2 lg:gap-[calc(15*var(--u))]">
        {rows.map((row) => {
          const Icon = jobLabelIcon(row.label);
          return (
            <li key={row.label} className={ROW}>
              <span className={CATEGORY_CHIP}>
                <Icon
                  aria-hidden
                  className="size-5 shrink-0 text-[#FF4B16] lg:size-[calc(22*var(--u))]"
                />
                <span title={row.label} className="min-w-0 truncate font-medium text-[#101828]">
                  {row.label}
                </span>
              </span>
              <span className={VALUE_CHIP}>{formatDays(row.average_days)}</span>
            </li>
          );
        })}
      </ul>
    </ReportCard>
  );
}
