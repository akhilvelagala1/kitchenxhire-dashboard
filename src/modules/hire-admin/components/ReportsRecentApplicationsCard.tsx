import { useMemo } from 'react';
import { type Column, DataTable } from '@/shared/components/DataTable';
import { formatDateTime } from '@/shared/lib/dates';
import type { RecentApplication } from '../schemas/adminReports';
import { ApplicationStatusBadge } from './ApplicationStatusBadge';
import { ReportCard } from './ReportCard';
import { useReportsApplications } from './useReportsApplications';

/** The newest applications of the window, newest first: a quick look without leaving the report. */
export function ReportsRecentApplicationsCard() {
  const { data, isLoading, error, refetch } = useReportsApplications();
  const rows = data?.recent_applications ?? [];

  const columns = useMemo<Column<RecentApplication>[]>(
    () => [
      { id: 'id', header: 'App ID', cell: (row) => row.id },
      { id: 'candidate_name', header: 'Applicant', cell: (row) => row.candidate_name },
      { id: 'job_title', header: 'Job Title', cell: (row) => row.job_title },
      { id: 'applied_on', header: 'Applied On', cell: (row) => formatDateTime(row.applied_on) },
      {
        id: 'status',
        header: 'Status',
        cell: (row) => <ApplicationStatusBadge status={row.status} />
      }
    ],
    []
  );

  return (
    <ReportCard
      title="Recent Applications"
      isLoading={isLoading}
      error={data ? undefined : error}
      onRetry={() => void refetch()}
      isEmpty={rows.length === 0}
      className="h-full min-h-0"
    >
      {/* The table's own rows run taller than this card's fixed height allows for all five at once,
          so it scrolls inside the card instead of spilling past the cards beside it. */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <DataTable<RecentApplication>
          framed={false}
          showPagination={false}
          columns={columns}
          rows={rows}
          getRowId={(row) => row.id}
          isLoading={false}
          error={undefined}
          onRetry={() => void refetch()}
          empty={{ title: 'No applications received in this window' }}
          caption="Recent applications"
        />
      </div>
    </ReportCard>
  );
}
