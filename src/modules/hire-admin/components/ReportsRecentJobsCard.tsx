import { useMemo } from 'react';
import { type Column, DataTable } from '@/shared/components/DataTable';
import { formatDateTime } from '@/shared/lib/dates';
import type { RecentJob } from '../schemas/adminReports';
import { HireJobStatusBadge } from './HireJobStatusBadge';
import { ReportCard } from './ReportCard';
import { formatCount } from './reportsFormat';
import { useReportsJobs } from './useReportsJobs';

/** The newest jobs of the window, newest first: a quick look without leaving the report. */
export function ReportsRecentJobsCard() {
  const { data, isLoading, error, refetch } = useReportsJobs();
  const rows = data?.recent_jobs ?? [];

  const columns = useMemo<Column<RecentJob>[]>(
    () => [
      { id: 'id', header: 'Job ID', cell: (row) => row.id },
      { id: 'title', header: 'Job Title', cell: (row) => row.title },
      { id: 'outlet', header: 'Outlet / Business', cell: (row) => row.outlet },
      { id: 'posted_on', header: 'Posted On', cell: (row) => formatDateTime(row.posted_on) },
      {
        id: 'applications',
        header: 'Applications',
        cell: (row) => formatCount(row.applications)
      },
      {
        id: 'status',
        header: 'Status',
        cell: (row) => <HireJobStatusBadge status={row.status} />
      }
    ],
    []
  );

  return (
    <ReportCard
      title="Recent Jobs"
      isLoading={isLoading}
      error={data ? undefined : error}
      onRetry={() => void refetch()}
      isEmpty={rows.length === 0}
      className="h-full min-h-0"
    >
      {/* The table's own rows run taller than this card's fixed height allows for all five at once,
          so it scrolls inside the card instead of spilling past Top Job Categories beside it. */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <DataTable<RecentJob>
          framed={false}
          showPagination={false}
          columns={columns}
          rows={rows}
          getRowId={(row) => row.id}
          isLoading={false}
          error={undefined}
          onRetry={() => void refetch()}
          empty={{ title: 'No jobs posted in this window' }}
          caption="Recent jobs"
        />
      </div>
    </ReportCard>
  );
}
