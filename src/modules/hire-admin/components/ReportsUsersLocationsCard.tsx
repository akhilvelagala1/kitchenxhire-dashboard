import { MapPin } from 'lucide-react';
import { ReportCard } from './ReportCard';
import { ReportsRankList } from './ReportsRankList';
import { useReportsUsers } from './useReportsUsers';

/** The five places with the most registered users, same cities and shares as Overview's Top Locations. */
export function ReportsUsersLocationsCard() {
  const { data, isLoading, error, refetch } = useReportsUsers();
  const rows = data?.top_locations ?? [];

  return (
    <ReportCard
      title="Users by Location"
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
        total={data?.kpis.total_users.value ?? 0}
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
