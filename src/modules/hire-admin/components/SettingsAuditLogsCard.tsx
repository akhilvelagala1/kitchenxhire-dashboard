import { useMemo } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Download, FileText } from 'lucide-react';
import { type Column, DataTable } from '@/shared/components/DataTable';
import { DateRangeFilter } from '@/shared/components/DateRangeFilter';
import { FilterBar } from '@/shared/components/FilterBar';
import { SearchInput } from '@/shared/components/SearchInput';
import { useListParams } from '@/shared/hooks/useListParams';
import { formatDateTime } from '@/shared/lib/dates';
import { Button } from '@/shared/ui/Button';
import { Select } from '@/shared/ui/Input';
import { adminSettingsAuditLogsApi } from '../api/adminSettingsAuditLogsApi';
import { adminSettingsKeys } from '../api/adminSettingsKeys';
import {
  AUDIT_LOG_ACTION_OPTIONS,
  AUDIT_LOG_MODULE_OPTIONS,
  type AuditLogAction,
  type AuditLogEntry
} from '../schemas/adminSettingsAuditLogs';

const PILL_BASE =
  'inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold';

const ACTION_PILL: Record<AuditLogAction, string> = {
  Updated: 'bg-[#FFF0B9] text-[#A86A00]',
  Created: 'bg-[#D9F9DF] text-[#087E29]',
  Deleted: 'bg-[#FFE0E0] text-[#C62828]'
};

const RESULT_PILL: Record<AuditLogEntry['result'], string> = {
  Success: 'bg-[#D8FBDC] text-[#087D25]',
  Failed: 'bg-[#FFE0E0] text-[#C62828]'
};

const CSV_HEADERS = [
  'Timestamp',
  'User',
  'Action',
  'Module',
  'Resource',
  'Details',
  'IP Address',
  'Result'
];

function csvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function buildAuditLogsCsv(items: AuditLogEntry[]): string {
  const rows = items.map((item) =>
    [
      formatDateTime(item.timestamp),
      item.user_name,
      item.action,
      item.module,
      item.resource,
      item.details,
      item.ip_address,
      item.result
    ]
      .map(csvCell)
      .join(',')
  );
  return [CSV_HEADERS.join(','), ...rows].join('\n');
}

/** The Audit Logs card: icon header, search/filter row with Export, and the paginated log table. */
export function SettingsAuditLogsCard() {
  const params = useListParams();
  const { query } = params;

  const auditQuery = useQuery({
    queryKey: [...adminSettingsKeys.auditLogs, query],
    queryFn: () => adminSettingsAuditLogsApi.list(query),
    placeholderData: keepPreviousData
  });

  const hasActive = Boolean(
    query.search || params.filters.module || params.filters.action || query.from || query.to
  );

  const columns = useMemo<Column<AuditLogEntry>[]>(
    () => [
      { id: 'timestamp', header: 'Timestamp', cell: (e) => formatDateTime(e.timestamp) },
      {
        id: 'user',
        header: 'User',
        cell: (e) => <span className="font-semibold">{e.user_name}</span>
      },
      {
        id: 'action',
        header: 'Action',
        cell: (e) => <span className={`${PILL_BASE} ${ACTION_PILL[e.action]}`}>{e.action}</span>
      },
      { id: 'module', header: 'Module', cell: (e) => e.module },
      { id: 'resource', header: 'Resource', cell: (e) => e.resource },
      {
        id: 'details',
        header: 'Details',
        className: 'lg:max-w-0 lg:min-w-32',
        cell: (e) => (
          <span className="truncate" title={e.details}>
            {e.details}
          </span>
        )
      },
      { id: 'ip_address', header: 'IP Address', cell: (e) => e.ip_address },
      {
        id: 'result',
        header: 'Result',
        cell: (e) => <span className={`${PILL_BASE} ${RESULT_PILL[e.result]}`}>{e.result}</span>
      }
    ],
    []
  );

  // Export is client-side from the loaded page only; a full export needs a server endpoint.
  function handleExport() {
    const items = auditQuery.data?.items ?? [];
    const blob = new Blob([buildAuditLogsCsv(items)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'KitchenX-Audit-Logs.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <section
      aria-label="Audit Logs"
      className="flex min-w-0 flex-col rounded-2xl border border-[#E9ECF2] bg-white p-4 shadow-[0_2px_8px_rgba(20,35,60,0.06)] lg:rounded-[calc(12*var(--u))] lg:px-[calc(22*var(--u))] lg:pt-[calc(22*var(--u))] lg:pb-[calc(13*var(--u))]"
    >
      <header className="flex items-center gap-3 lg:gap-[calc(14*var(--u))]">
        <span
          aria-hidden
          className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#FFF0E8] text-[#C2410C] lg:size-[calc(48*var(--u))] lg:rounded-[calc(12*var(--u))]"
        >
          <FileText className="size-6 lg:size-[calc(22*var(--u))]" strokeWidth={1.75} />
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-[#17191F] lg:text-[calc(20*var(--u))]">
            Audit Logs
          </h2>
          <p className="mt-0.5 text-sm text-[#667085] lg:mt-[calc(3*var(--u))] lg:text-[calc(13*var(--u))]">
            View and track all platform activities and changes.
          </p>
        </div>
      </header>

      <div className="mt-3 flex min-h-0 flex-1 flex-col lg:mt-[calc(16*var(--u))]">
        <FilterBar onReset={params.reset} hasActive={hasActive}>
          <SearchInput
            value={query.search}
            onChange={params.setSearch}
            placeholder="Search by user, action or resource..."
          />
          <Select
            aria-label="Module"
            value={params.filters.module ?? ''}
            onChange={(e) => params.setFilter('module', e.target.value || undefined)}
            className="md:w-44"
          >
            <option value="">All Modules</option>
            {AUDIT_LOG_MODULE_OPTIONS.map((module) => (
              <option key={module} value={module}>
                {module}
              </option>
            ))}
          </Select>
          <Select
            aria-label="Action"
            value={params.filters.action ?? ''}
            onChange={(e) => params.setFilter('action', e.target.value || undefined)}
            className="md:w-36"
          >
            <option value="">All Actions</option>
            {AUDIT_LOG_ACTION_OPTIONS.map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </Select>
          <DateRangeFilter from={query.from} to={query.to} onChange={params.setDateRange} />
          <Button variant="secondary" onClick={handleExport} className="gap-2">
            <Download aria-hidden className="size-4" />
            Export
          </Button>
        </FilterBar>

        <DataTable<AuditLogEntry>
          framed={false}
          columns={columns}
          rows={auditQuery.data?.items}
          getRowId={(e) => e.id}
          isLoading={auditQuery.isLoading}
          error={auditQuery.error}
          onRetry={() => auditQuery.refetch()}
          empty={{ title: 'No audit logs found' }}
          caption="Audit logs"
          pagination={{
            page: query.page,
            pageSize: query.page_size,
            total: auditQuery.data?.meta.total ?? 0,
            onPageChange: params.setPage,
            onPageSizeChange: params.setPageSize
          }}
        />
      </div>
    </section>
  );
}
