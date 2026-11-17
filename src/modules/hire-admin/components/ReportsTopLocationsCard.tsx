import { MapPin } from 'lucide-react';
import { ReportCard } from './ReportCard';
import { ReportsRankList } from './ReportsRankList';
import { useReportsOverview } from './useReportsOverview';

/** The five places with the most applications, each with its share of all applications. */
export function ReportsTopLocationsCard() {
  const { data, isLoading, error, refetch } = useReportsOverview();
  const rows = data?.top_locations ?? [];

  return (
    <ReportCard
      title="Top Locations"
      titleNote="(Applications)"
      icon={
        <MapPin
          aria-hidden
          className="size-5 shrink-0 text-[#FF4B16] lg:size-[calc(22*var(--u))]"
        />
      }
      isLoading={isLoading}
      error={data ? undefined : error}
      onRetry={() => void refetch()}
      isEmpty={rows.length === 0}
      className="h-full min-h-0 lg:pr-[calc(11*var(--u))]"
    >
      <ReportsRankList
        variant="location"
        rows={rows}
        total={data?.kpis.applications.value ?? 0}
        renderIcon={() => (
          <MapPin
            aria-hidden
            className="size-4 shrink-0 text-[#667085] lg:size-[calc(16*var(--u))]"
          />
        )}
      />
    </ReportCard>
  );
}
