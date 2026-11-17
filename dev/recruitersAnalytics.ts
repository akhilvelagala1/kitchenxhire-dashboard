/**
 * The read side of the Recruiters mock: the list query (filter, sort, page) that the list and the export
 * share, and the dashboard numbers around it.
 *
 * The summary is computed live from the store, so a status change moves the counts. The trend is
 * INDEPENDENT analytics, not recomputed from the stored rows: it is cut from one fixed daily series of
 * "active recruiters" levels (a level, not a period total), so the 7-day, 30-day and 90-day charts agree
 * with each other and the 30-day chart ends on 312 like the Total Recruiters card.
 */
import type { HireAdminRecruiter, RecruiterStatus } from './recruitersMockData.ts';

interface RecruiterFilters {
  tab?: string;
  status?: string;
  business_type?: string;
  verification?: string;
  city?: string;
  search?: string;
  joined?: string;
}

export interface RecruitersQuery extends RecruiterFilters {
  sort?: string;
  order?: string;
  page?: number;
  page_size?: number;
}

const FILTER_KEYS = [
  'tab',
  'status',
  'business_type',
  'verification',
  'city',
  'search',
  'joined'
] as const;

/** Reads the list filters from a query string or a request body; blank values are left out. */
export function pickFilters(source: Record<string, unknown>): RecruiterFilters {
  const out: RecruiterFilters = {};
  for (const key of FILTER_KEYS) {
    const value = source[key];
    if (typeof value === 'string' && value.trim() !== '') out[key] = value.trim();
  }
  return out;
}

const DAY_MS = 24 * 60 * 60_000;
/** The end of 24 Jun 2024, India time: where every "joined within the last N days" window closes. */
const END_OF_TODAY_MS = Date.parse('2024-06-25T00:00:00+05:30');
const JOINED_DAYS: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90 };

/** The tab narrows by exact status. */
const TAB_STATUS: Record<string, RecruiterStatus> = {
  active: 'active',
  inactive: 'inactive',
  pending: 'pending',
  suspended: 'suspended'
};

/** Every filter combines with the others (intersection). `joined` filters last login. */
export function filterRecruiters(
  rows: readonly HireAdminRecruiter[],
  f: RecruiterFilters
): HireAdminRecruiter[] {
  const tabStatus = f.tab ? TAB_STATUS[f.tab] : undefined;
  const status = f.status && f.status !== 'all' ? f.status : undefined;
  const verification = f.verification && f.verification !== 'all' ? f.verification : undefined;
  const days = f.joined ? JOINED_DAYS[f.joined] : undefined;
  const since = days === undefined ? undefined : END_OF_TODAY_MS - days * DAY_MS;
  const needle = f.search?.toLowerCase();
  return rows.filter((r) => {
    if (tabStatus && r.status !== tabStatus) return false;
    if (status && r.status !== status) return false;
    if (verification && r.verification !== verification) return false;
    if (f.business_type && r.business_type !== f.business_type) return false;
    if (f.city && r.city !== f.city) return false;
    if (since !== undefined) {
      if (r.last_login_at === null) return false;
      const loginMs = Date.parse(r.last_login_at);
      if (loginMs < since || loginMs >= END_OF_TODAY_MS) return false;
    }
    if (!needle) return true;
    return [r.business_name, r.recruiter_id, r.owner_name, r.email, r.phone].some((v) =>
      v.toLowerCase().includes(needle)
    );
  });
}

const compare = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

function sortValue(row: HireAdminRecruiter, sort: string): string {
  if (sort === 'last_login_at') return row.last_login_at ?? '';
  if (sort === 'owner_name') return row.owner_name;
  if (sort === 'business_name') return row.business_name;
  if (sort === 'recruiter_id') return row.recruiter_id;
  return row.joined_at;
}

/** Sorts by last_login_at (default), joined_at, names or id; pages are 1-based, 1 to 100 rows. */
export function listRecruiters(rows: readonly HireAdminRecruiter[], q: RecruitersQuery) {
  const sort = q.sort ?? 'last_login_at';
  const dir = q.order === 'asc' ? 1 : -1;
  const sorted = filterRecruiters(rows, q).sort((a, b) => {
    const av = sortValue(a, sort);
    const bv = sortValue(b, sort);
    return (compare(av, bv) || compare(a.recruiter_id, b.recruiter_id)) * dir;
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
  total: 7,
  active: 8,
  inactive: -4,
  pending: 12,
  suspended: -8,
  outlets: 14,
  open_jobs: 12,
  hiring_actions: 18
};
/** Hiring actions are not stored per recruiter, so the card shows a fixed figure. */
const HIRING_ACTIONS = 4862;

export function recruitersSummary(rows: readonly HireAdminRecruiter[]) {
  let active = 0;
  let inactive = 0;
  let pending = 0;
  let suspended = 0;
  let outlets = 0;
  let openJobs = 0;
  for (const row of rows) {
    if (row.status === 'active') active += 1;
    if (row.status === 'inactive') inactive += 1;
    if (row.status === 'pending') pending += 1;
    if (row.status === 'suspended') suspended += 1;
    outlets += row.outlets;
    openJobs += row.open_jobs;
  }
  return {
    total: rows.length,
    active,
    inactive,
    pending,
    suspended,
    outlets,
    open_jobs: openJobs,
    hiring_actions: HIRING_ACTIONS,
    growth_pct: { ...GROWTH_PCT }
  };
}

/** The cities that have a recruiter, for the Locations filter: value and label are the city, sorted. */
export function recruiterLocations(rows: readonly HireAdminRecruiter[]) {
  return [...new Set(rows.map((r) => r.city).filter((city) => city !== ''))]
    .sort((a, b) => a.localeCompare(b, 'en'))
    .map((city) => ({ value: city, label: city }));
}

function addDays(day: string, days: number): string {
  return new Date(Date.parse(`${day}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);
}

const TREND_END = '2024-06-24';

/** Active recruiters on days the three charts have in common; the days between are drawn as a straight line. */
const LEVELS: [string, number][] = [
  ['2024-03-26', 176],
  ['2024-04-10', 179],
  ['2024-04-25', 183],
  ['2024-05-10', 187],
  ['2024-05-25', 192],
  ['2024-05-30', 236],
  ['2024-06-04', 232],
  ['2024-06-09', 262],
  ['2024-06-14', 268],
  ['2024-06-19', 290],
  [TREND_END, 312]
];

const dayNumber = (day: string) => Date.parse(`${day}T00:00:00Z`) / DAY_MS;

function levelOn(day: string): number {
  const at = dayNumber(day);
  for (let i = 1; i < LEVELS.length; i++) {
    const [endDay, endLevel] = LEVELS[i]!;
    const end = dayNumber(endDay);
    if (at <= end) {
      const [startDay, startLevel] = LEVELS[i - 1]!;
      const start = dayNumber(startDay);
      return Math.round(startLevel + ((endLevel - startLevel) * (at - start)) / (end - start));
    }
  }
  return LEVELS[LEVELS.length - 1]![1];
}

/** Days between points: a day, five days, or fifteen days. Seven points per range. */
const POINT_GAP_DAYS = new Map([
  ['7d', 1],
  ['30d', 5],
  ['90d', 15]
]);

/** Seven points, each the level on its date, the last on 24 Jun 2024. An unknown range gives 30d. */
export function recruitersTrend(range: string) {
  const gap = POINT_GAP_DAYS.get(range) ?? 5;
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(TREND_END, -(6 - i) * gap);
    return { date, count: levelOn(date) };
  });
}
