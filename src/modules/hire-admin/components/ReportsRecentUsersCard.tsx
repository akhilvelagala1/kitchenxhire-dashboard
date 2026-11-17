import { useMemo } from 'react';
import { type Column, DataTable } from '@/shared/components/DataTable';
import { formatDateTime } from '@/shared/lib/dates';
import type { PlatformUserType, RecentUser } from '../schemas/adminReports';
import { ReportCard } from './ReportCard';
import { useReportsUsers } from './useReportsUsers';
import { UserStatusBadge } from './UserStatusBadge';

/** Singular, for one row of the table; the donut's own labels are plural, for a legend. */
const USER_TYPE_LABELS: Record<PlatformUserType, string> = {
  job_seeker: 'Job Seeker',
  business: 'Business / Outlet',
  recruiter: 'Recruiter',
  admin: 'Admin'
};

/** The newest accounts of the window, newest first: a quick look without leaving the report. */
export function ReportsRecentUsersCard() {
  const { data, isLoading, error, refetch } = useReportsUsers();
  const rows = data?.recent_users ?? [];

  const columns = useMemo<Column<RecentUser>[]>(
    () => [
      { id: 'id', header: 'User ID', cell: (row) => row.id },
      { id: 'name', header: 'User Name', cell: (row) => row.name },
      { id: 'user_type', header: 'User Type', cell: (row) => USER_TYPE_LABELS[row.user_type] },
      {
        id: 'registered_on',
        header: 'Registered On',
        cell: (row) => formatDateTime(row.registered_on)
      },
      {
        id: 'status',
        header: 'Status',
        cell: (row) => <UserStatusBadge status={row.status} />
      }
    ],
    []
  );

  return (
    <ReportCard
      title="Recent Users"
      isLoading={isLoading}
      error={data ? undefined : error}
      onRetry={() => void refetch()}
      isEmpty={rows.length === 0}
      className="h-full min-h-0"
    >
      {/* The table's own rows run taller than this card's fixed height allows for all five at once,
          so it scrolls inside the card instead of spilling past the cards beside it. */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <DataTable<RecentUser>
          framed={false}
          showPagination={false}
          columns={columns}
          rows={rows}
          getRowId={(row) => row.id}
          isLoading={false}
          error={undefined}
          onRetry={() => void refetch()}
          empty={{ title: 'No users registered in this window' }}
          caption="Recent users"
        />
      </div>
    </ReportCard>
  );
}
