/**
 * The read side of the Job Seekers mock: the list query (filter, sort, page) that the list and the
 * export share, and the dashboard numbers around it.
 *
 * The summary is computed live from the store, so a status change moves the counts. The trend is
 * INDEPENDENT analytics, not recomputed from the stored rows: it is cut from one fixed daily series
 * of active job seekers, so the 7-day, 30-day and 90-day charts agree with each other.
 */
import type { HireAdminJobSeeker } from './jobSeekersMockData.ts';

interface JobSeekerFilters {
  tab?: string;
  status?: string;
  experience?: string;
  city?: string;
  search?: string;
  joined?: string;
}

export interface JobSeekersQuery extends JobSeekerFilters {
  sort?: string;
  order?: string;
  page?: number;
  page_size?: number;
}

const FILTER_KEYS = ['tab', 'status', 'experience', 'city', 'search', 'joined'] as const;

/** Reads the list filters from a query string or a request body; blank values are left out. */
export function pickJobSeekerFilters(source: Record<string, unknown>): JobSeekerFilters {
  const out: JobSeekerFilters = {};
  for (const key of FILTER_KEYS) {
    const value = source[key];
    if (typeof value === 'string' && value.trim() !== '') out[key] = value.trim();
  }
  return out;
}

const DAY_MS = 24 * 60 * 60_000;
const JOINED_DAYS: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90 };
/** Midnight at the end of 24 Jun 2024, India time: activity filters count back from here. */
const END_OF_TODAY_MS = Date.parse('2024-06-25T00:00:00+05:30');

/** Whole years of experience in a band of the "All Experience" filter. An unknown band matches everyone. */
function inBand(band: string | undefined, years: number): boolean {
  if (band === '0-1') return years <= 1;
  if (band === '2-3') return years >= 2 && years <= 3;
  if (band === '4-5') return years >= 4 && years <= 5;
  if (band === '6+') return years >= 6;
  return true;
}

/**
 * Tabs: Active is status active; Inactive is every non-active status (inactive, under_review,
 * suspended). Unknown means all.
 */
function inTab(tab: string | undefined, row: HireAdminJobSeeker): boolean {
  if (tab === 'active') return row.status === 'active';
  if (tab === 'inactive') return row.status !== 'active';
  return true;
}

/** Every filter combines with the others (intersection). `joined` filters last_active_at. */
export function filterJobSeekers(
  rows: readonly HireAdminJobSeeker[],
  f: JobSeekerFilters
): HireAdminJobSeeker[] {
  const days = f.joined ? JOINED_DAYS[f.joined] : undefined;
  const since = days === undefined ? undefined : END_OF_TODAY_MS - days * DAY_MS;
  const status = f.status && f.status !== 'all' ? f.status : undefined;
  const needle = f.search?.toLowerCase();
  return rows.filter((r) => {
    if (!inTab(f.tab, r)) return false;
    if (status && r.status !== status) return false;
    if (!inBand(f.experience, r.experience_years)) return false;
    if (f.city && r.city !== f.city) return false;
    if (since !== undefined) {
      if (r.last_active_at === null) return false;
      const activeMs = Date.parse(r.last_active_at);
      if (activeMs < since || activeMs >= END_OF_TODAY_MS) return false;
    }
    if (!needle) return true;
    return [r.name, r.email, r.phone, r.job_seeker_id].some((v) =>
      v.toLowerCase().includes(needle)
    );
  });
}

const SORTS = [
  'last_active_at',
  'joined_at',
  'name',
  'job_seeker_id',
  'applications_count',
  'profile_completion'
] as const;
type SortKey = (typeof SORTS)[number];

const compare = (a: string | number, b: string | number) => (a < b ? -1 : a > b ? 1 : 0);

function sortValue(row: HireAdminJobSeeker, sort: SortKey): string | number {
  if (sort === 'last_active_at') return row.last_active_at ?? '';
  if (sort === 'name') return row.name;
  if (sort === 'job_seeker_id') return row.job_seeker_id;
  if (sort === 'applications_count') return row.applications_count;
  if (sort === 'profile_completion') return row.profile_completion;
  return row.joined_at;
}

/** Sorts by last_active_at (default); pages are 1-based, 1 to 100 rows, 10 by default. */
export function listJobSeekers(rows: readonly HireAdminJobSeeker[], q: JobSeekersQuery) {
  const sort: SortKey = SORTS.find((s) => s === q.sort) ?? 'last_active_at';
  const dir = q.order === 'asc' ? 1 : -1;
  const sorted = filterJobSeekers(rows, q).sort((a, b) => {
    const byName = sort === 'name' ? a.name.localeCompare(b.name, 'en') : 0;
    return (
      (byName ||
        compare(sortValue(a, sort), sortValue(b, sort)) ||
        compare(a.job_seeker_id, b.job_seeker_id)) * dir
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
  active: 16,
  inactive: -6,
  total_applications: 18,
  shortlisted: 12,
  hired: 20
};

export function jobSeekersSummary(rows: readonly HireAdminJobSeeker[]) {
  const summary = {
    total: rows.length,
    active: 0,
    inactive: 0,
    total_applications: 0,
    shortlisted: 0,
    hired: 0
  };
  for (const row of rows) {
    if (row.status === 'active') summary.active += 1;
    else summary.inactive += 1;
    summary.total_applications += row.applications_count;
    if (row.shortlisted_count > 0) summary.shortlisted += 1;
    if (row.hired_count > 0) summary.hired += 1;
  }
  return { ...summary, growth_pct: { ...GROWTH_PCT } };
}

/** The cities job seekers are in, for the Locations filter: value and label are the city, sorted. */
export function jobSeekerLocations(rows: readonly HireAdminJobSeeker[]) {
  return [...new Set(rows.map((r) => r.city))]
    .sort((a, b) => a.localeCompare(b, 'en'))
    .map((city) => ({ value: city, label: city }));
}

function addDays(day: string, days: number): string {
  return new Date(Date.parse(`${day}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);
}

const TREND_END = '2024-06-24';
/** Active job seekers on the days the picture shows; the days in between are straight lines. */
const ANCHORS: [string, number][] = [
  ['2024-03-26', 8200],
  ['2024-04-10', 8400],
  ['2024-04-25', 8650],
  ['2024-05-10', 8800],
  ['2024-05-25', 9000],
  ['2024-05-30', 10100],
  ['2024-06-04', 10000],
  ['2024-06-09', 10800],
  ['2024-06-14', 11000],
  ['2024-06-19', 11600],
  [TREND_END, 12846]
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

/** Days between two points: a day, five days, or fifteen days. Seven points per range. */
const STEP_DAYS = new Map([
  ['7d', 1],
  ['30d', 5],
  ['90d', 15]
]);

/** Seven points, each the LEVEL (active job seekers) on its date, not a total for the period. */
export function jobSeekersTrend(range: string) {
  const step = STEP_DAYS.get(range) ?? 5;
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(TREND_END, -(6 - i) * step);
    return { date, count: LEVELS.get(date) ?? 0 };
  });
}
