import { useMemo } from 'react';
import { type Column, DataTable } from '@/shared/components/DataTable';
import { formatDateTime } from '@/shared/lib/dates';
import type { RecentRecruiter } from '../schemas/adminReports';
import { ReportCard } from './ReportCard';
import { RecruiterStatusBadge } from './RecruiterStatusBadge';
import { formatCount } from './reportsFormat';
import { useReportsRecruiters } from './useReportsRecruiters';

/** The newest recruiters of the window, newest first: a quick look without leaving the report. */
export function ReportsRecentRecruitersCard() {
  const { data, isLoading, error, refetch } = useReportsRecruiters();
  const rows = data?.recent_recruiters ?? [];

  const columns = useMemo<Column<RecentRecruiter>[]>(
    () => [
      { id: 'id', header: 'Recruiter ID', cell: (row) => row.id },
      { id: 'name', header: 'Recruiter Name', cell: (row) => row.name },
      { id: 'outlet', header: 'Business / Outlet', cell: (row) => row.outlet },
      { id: 'joined_on', header: 'Joined On', cell: (row) => formatDateTime(row.joined_on) },
      { id: 'jobs_posted', header: 'Jobs Posted', cell: (row) => formatCount(row.jobs_posted) },
      { id: 'hires', header: 'Hires', cell: (row) => formatCount(row.hires) },
      {
        id: 'status',
        header: 'Status',
        cell: (row) => <RecruiterStatusBadge status={row.status} />
      }
    ],
    []
  );

  return (
    <ReportCard
      title="Recent Recruiters"
      isLoading={isLoading}
      error={data ? undefined : error}
      onRetry={() => void refetch()}
      isEmpty={rows.length === 0}
      className="h-full min-h-0"
    >
      {/* The table's own rows run taller than this card's fixed height allows for all five at once,
          so it scrolls inside the card instead of spilling past the card beside it. */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <DataTable<RecentRecruiter>
          framed={false}
          showPagination={false}
          columns={columns}
          rows={rows}
          getRowId={(row) => row.id}
          isLoading={false}
          error={undefined}
          onRetry={() => void refetch()}
          empty={{ title: 'No recruiters joined in this window' }}
          caption="Recent recruiters"
        />
      </div>
    </ReportCard>
  );
}
