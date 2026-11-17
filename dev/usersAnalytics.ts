/**
 * The read side of the Users mock: the list query (filter, sort, page) that the list and the export
 * share, and the dashboard numbers around it.
 *
 * The summary is computed live from the store, so a status change moves the counts. The trend is
 * INDEPENDENT analytics, not recomputed from the stored rows: it is cut from one fixed daily series
 * of the running total of staff accounts, so the 7-day, 30-day and 90-day charts agree with each other
 * and the 30-day chart ends on 128 like the Total Users card of the picture.
 */
import { MOCK_NOW_MS, toIstIso, type HireAdminUser, type UserStatus } from './usersMockData.ts';

interface UserFilters {
  tab?: string;
  status?: string;
  role?: string;
  department?: string;
  search?: string;
  active?: string;
}

export interface UsersQuery extends UserFilters {
  sort?: string;
  order?: string;
  page?: number;
  page_size?: number;
}

const FILTER_KEYS = ['tab', 'status', 'role', 'department', 'search', 'active'] as const;

/** Reads the list filters from a query string or a request body; blank values are left out. */
export function pickUserFilters(source: Record<string, unknown>): UserFilters {
  const out: UserFilters = {};
  for (const key of FILTER_KEYS) {
    const value = source[key];
    if (typeof value === 'string' && value.trim() !== '') out[key] = value.trim();
  }
  return out;
}

const DAY_MS = 24 * 60 * 60_000;
const ACTIVE_DAYS: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90 };
/** Midnight at the end of 10 Nov 2026, India time: the date windows count back from here. */
const END_OF_TODAY_MS = Date.parse('2026-11-11T00:00:00+05:30');

/** The tabs: one per status. An unknown tab means all. */
function inTab(tab: string | undefined, row: HireAdminUser): boolean {
  return tab === undefined || tab === 'all' || row.status === (tab as UserStatus);
}

/**
 * Every filter combines with the others (intersection). An unknown tab or preset filters nothing.
 * `active` looks at the last sign-in, or at the day the invite was sent for someone who never signed in.
 */
export function filterUsers(rows: readonly HireAdminUser[], f: UserFilters): HireAdminUser[] {
  const days = f.active ? ACTIVE_DAYS[f.active] : undefined;
  const from = days === undefined ? '' : toIstIso(END_OF_TODAY_MS - days * DAY_MS);
  const to = toIstIso(END_OF_TODAY_MS);
  const status = f.status && f.status !== 'all' ? f.status : undefined;
  const needle = f.search?.toLowerCase();
  return rows.filter((r) => {
    if (!inTab(f.tab, r)) return false;
    if (status && r.status !== status) return false;
    if (f.role && r.role !== f.role) return false;
    if (f.department && r.department !== f.department) return false;
    const seen = r.last_login_at ?? r.created_at;
    if (days !== undefined && (seen < from || seen >= to)) return false;
    if (!needle) return true;
    return [r.name, r.email, r.user_id].some((v) => v.toLowerCase().includes(needle));
  });
}

const SORTS = ['user_id', 'name', 'last_login_at'] as const;
type SortKey = (typeof SORTS)[number];

const compare = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
const sortValue = (row: HireAdminUser, key: SortKey): string =>
  key === 'last_login_at' ? (row.last_login_at ?? '') : row[key];

/** Sorts by last login, newest first (the default); pages are 1-based, 10 by default. */
export function listUsers(rows: readonly HireAdminUser[], q: UsersQuery) {
  const sort: SortKey = SORTS.find((s) => s === q.sort) ?? 'last_login_at';
  const dir = q.order === 'asc' ? 1 : -1;
  const sorted = filterUsers(rows, q).sort((a, b) => {
    const byName = sort === 'name' ? a.name.localeCompare(b.name, 'en') : 0;
    return (
      (byName || compare(sortValue(a, sort), sortValue(b, sort)) || compare(a.user_id, b.user_id)) *
      dir
    );
  });
  const page = Math.max(1, Math.floor(q.page ?? 1) || 1);
  const rawSize = Math.floor(q.page_size ?? 10) || 10;
  const pageSize = Math.min(100, Math.max(1, rawSize));
  return {
    items: sorted.slice((page - 1) * pageSize, page * pageSize),
    meta: { page, page_size: pageSize, total: sorted.length }
  };
}

/** Change against the previous period needs history the mock does not keep, so these stay fixed. */
const GROWTH_PCT = {
  total: 14,
  active: 12,
  inactive: -20,
  administrators: 0,
  pending: 25,
  suspended: -25
};

export function usersSummary(rows: readonly HireAdminUser[]) {
  const summary = {
    total: rows.length,
    active: 0,
    inactive: 0,
    administrators: 0,
    pending: 0,
    suspended: 0
  };
  for (const row of rows) {
    summary[row.status] += 1;
    if (row.role === 'Super Admin') summary.administrators += 1;
  }
  return { ...summary, growth_pct: { ...GROWTH_PCT } };
}

function addDays(day: string, days: number): string {
  return new Date(Date.parse(`${day}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);
}

const TREND_END = toIstIso(MOCK_NOW_MS).slice(0, 10);
/** The running total on the days the picture shows; the days in between are straight lines. */
const ANCHORS: [string, number][] = [
  ['2026-08-13', 4],
  ['2026-09-12', 9],
  ['2026-10-12', 15],
  ['2026-10-16', 42],
  ['2026-10-21', 60],
  ['2026-10-26', 68],
  ['2026-10-31', 100],
  ['2026-11-05', 104],
  [TREND_END, 128]
];

const LEVELS = (() => {
  const daily = new Map<string, number>();
  for (let i = 1; i < ANCHORS.length; i++) {
    const [fromDay, from] = ANCHORS[i - 1]!;
    const [toDay, to] = ANCHORS[i]!;
    const span = Math.round((Date.parse(toDay) - Date.parse(fromDay)) / DAY_MS);
    for (let d = 0; d < span; d++) {
      daily.set(addDays(fromDay, d), Math.round(from + ((to - from) * d) / span));
    }
  }
  daily.set(TREND_END, ANCHORS[ANCHORS.length - 1]![1]);
  return daily;
})();

/** Days back from today of the seven points of each range; the picture's 30 days start on 12 Oct. */
const TREND_OFFSETS = new Map([
  ['7d', [6, 5, 4, 3, 2, 1, 0]],
  ['30d', [29, 25, 20, 15, 10, 5, 0]],
  ['90d', [89, 74, 59, 44, 29, 14, 0]]
]);

/** Seven points, each the running total of accounts on its date. */
export function usersTrend(range: string) {
  const offsets = TREND_OFFSETS.get(range) ?? TREND_OFFSETS.get('30d')!;
  return offsets.map((back) => {
    const date = addDays(TREND_END, -back);
    return { date, count: LEVELS.get(date) ?? 0 };
  });
}
