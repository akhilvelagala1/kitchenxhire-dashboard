/**
 * In-memory Audit & Logs mock for the dev mock. Read-only: there is no create/update/delete here.
 * The 5 fixed entries below are page 1 of a much larger real audit trail — `total` stays at 248
 * rather than growing to match them. Fixed ISO timestamps, India time; nothing here reads the clock
 * or Math.random().
 */
import type { AuditLogEntry } from '../src/modules/hire-admin/schemas/adminSettingsAuditLogs.ts';
import type { ListQuery } from '../src/shared/api/types.ts';

const ENTRIES: AuditLogEntry[] = [
  {
    id: 'al-1',
    timestamp: '2025-06-24T10:24:00+05:30',
    user_name: 'Ramesh Kumar',
    action: 'Updated',
    module: 'Settings',
    resource: 'Platform Preferences',
    details: 'Updated platform preferences',
    ip_address: '192.168.1.12',
    result: 'Success'
  },
  {
    id: 'al-2',
    timestamp: '2025-06-24T09:18:00+05:30',
    user_name: 'Priya Sharma',
    action: 'Created',
    module: 'User Management',
    resource: 'Admin User',
    details: 'Added new admin user',
    ip_address: '192.168.1.15',
    result: 'Success'
  },
  {
    id: 'al-3',
    timestamp: '2025-06-23T18:42:00+05:30',
    user_name: 'Arjun Reddy',
    action: 'Deleted',
    module: 'Jobs',
    resource: 'Job (JOB-7842)',
    details: 'Deleted job (JOB-7842)',
    ip_address: '192.168.1.18',
    result: 'Success'
  },
  {
    id: 'al-4',
    timestamp: '2025-06-23T16:10:00+05:30',
    user_name: 'Sangeetha Devi',
    action: 'Updated',
    module: 'Businesses',
    resource: 'Outlet Details',
    details: 'Updated outlet details',
    ip_address: '192.168.1.20',
    result: 'Success'
  },
  {
    id: 'al-5',
    timestamp: '2025-06-22T11:33:00+05:30',
    user_name: 'Ramesh Kumar',
    action: 'Updated',
    module: 'Security',
    resource: 'Password Policy',
    details: 'Changed password policy',
    ip_address: '192.168.1.12',
    result: 'Success'
  }
];

/** The real dataset's size; the 5 rows above are only its first page. */
const TOTAL_AUDIT_LOGS = 248;

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 25;

/** Case-insensitive substring match across every field the search box covers. */
function matchesSearch(entry: AuditLogEntry, needle: string): boolean {
  const haystack =
    `${entry.user_name} ${entry.module} ${entry.resource} ${entry.details}`.toLowerCase();
  return haystack.includes(needle);
}

/**
 * Reads one page of audit log entries, filtered by `search` (user, module, resource, details) and by
 * the `action` and `module` filters when present. `total` is fixed at 248 — the entries here are page
 * 1 of a much larger real dataset, so it is never derived from the filtered rows. `page`/`page_size`
 * echo the query, defaulting to 1 and 25 when absent.
 */
export function getAuditLogs(query: ListQuery): {
  items: AuditLogEntry[];
  total: number;
  page: number;
  page_size: number;
} {
  const needle = query.search?.trim().toLowerCase();
  const actionFilter = typeof query.action === 'string' ? query.action : undefined;
  const moduleFilter = typeof query.module === 'string' ? query.module : undefined;

  const items = ENTRIES.filter((entry) => {
    if (needle && !matchesSearch(entry, needle)) return false;
    if (actionFilter && entry.action !== actionFilter) return false;
    if (moduleFilter && entry.module !== moduleFilter) return false;
    return true;
  });

  return {
    items,
    total: TOTAL_AUDIT_LOGS,
    page: query.page ?? DEFAULT_PAGE,
    page_size: query.page_size ?? DEFAULT_PAGE_SIZE
  };
}

/** Test-only: a no-op, kept to match the reset*() convention of the other settings*MockData.ts files. */
export function resetAuditLogs(): void {}
