/**
 * The read side of the Applications mock: the list query (filter, sort, page) that the list and the
 * export share, and the dashboard numbers around it.
 *
 * The summary is computed live from the store, so a status change moves the counts. The trend is
 * INDEPENDENT analytics, not recomputed from the 8,672 stored rows: it is cut from one fixed daily
 * series, so the 7-day, 30-day and 90-day charts agree with each other, and the 30-day chart ends on
 * 1,460 like the Shortlisted card. The 90-day total stays under the 8,672 applications in the store.
 */
import {
  APPLICATION_TABS,
  getApplicationJobs,
  TAB_STATUSES,
  type ApplicationTab,
  type HireAdminApplication,
  type HireApplicationStatus
} from './applicationsMockData.ts';

interface ApplicationFilters {
  tab?: string;
  status?: string;
  job_id?: string;
  recruiter_id?: string;
  location?: string;
  search?: string;
  from?: string;
  to?: string;
}

export interface ApplicationsQuery extends ApplicationFilters {
  sort?: string;
  order?: string;
  page?: number;
  page_size?: number;
}

const FILTER_KEYS = [
  'tab',
  'status',
  'job_id',
  'recruiter_id',
  'location',
  'search',
  'from',
  'to'
] as const;

/** Reads the list filters from a query string or a request body; blank values are left out. */
export function pickFilters(source: Record<string, unknown>): ApplicationFilters {
  const out: ApplicationFilters = {};
  for (const key of FILTER_KEYS) {
    const value = source[key];
    if (typeof value === 'string' && value.trim() !== '') out[key] = value.trim();
  }
  return out;
}

const DAY_KEY = /^\d{4}-\d{2}-\d{2}$/;

/** Every filter combines with the others (intersection). `from` and `to` are India-time dates. */
export function filterApplications(
  rows: readonly HireAdminApplication[],
  f: ApplicationFilters
): HireAdminApplication[] {
  const tabStatuses: readonly HireApplicationStatus[] | undefined = APPLICATION_TABS.includes(
    f.tab as ApplicationTab
  )
    ? TAB_STATUSES[f.tab as ApplicationTab]
    : undefined;
  const status = f.status && f.status !== 'all' ? f.status : undefined;
  const from = f.from && DAY_KEY.test(f.from) ? f.from : undefined;
  const to = f.to && DAY_KEY.test(f.to) ? f.to : undefined;
  const needle = f.search?.toLowerCase();
  return rows.filter((r) => {
    if (tabStatuses && !tabStatuses.includes(r.status)) return false;
    if (status && r.status !== status) return false;
    if (f.job_id && r.job_id !== f.job_id) return false;
    if (f.recruiter_id && r.recruiter_id !== f.recruiter_id) return false;
    if (f.location && r.location !== f.location) return false;
    const day = r.applied_at.slice(0, 10);
    if ((from && day < from) || (to && day > to)) return false;
    if (!needle) return true;
    return [r.candidate_name, r.candidate_email, r.candidate_phone, r.application_id].some((v) =>
      v.toLowerCase().includes(needle)
    );
  });
}

const compare = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

/** Sorts by applied_at (the default), application_id or candidate_name; pages are 1-based, 1 to 100 rows. */
export function listApplications(rows: readonly HireAdminApplication[], q: ApplicationsQuery) {
  const sort =
    q.sort === 'application_id' || q.sort === 'candidate_name' ? q.sort : ('applied_at' as const);
  const dir = q.order === 'asc' ? 1 : -1;
  const sorted = filterApplications(rows, q).sort((a, b) => {
    const byName = sort === 'candidate_name' ? a[sort].localeCompare(b[sort], 'en') : 0;
    return (
      (byName || compare(a[sort], b[sort]) || compare(a.application_id, b.application_id)) * dir
    );
  });
  const page = Math.max(1, Math.floor(q.page ?? 1) || 1);
  const pageSize = Math.min(100, Math.max(1, Math.floor(q.page_size ?? 5) || 5));
  return {
    items: sorted.slice((page - 1) * pageSize, page * pageSize),
    meta: { page, page_size: pageSize, total: sorted.length }
  };
}

/** Change against the previous period needs history the mock does not keep, so these stay fixed. */
const GROWTH_PCT: Record<ApplicationTab, number> = {
  all: 18,
  reviewed: 16,
  shortlisted: 9,
  interview_scheduled: 14,
  hired: 12,
  rejected: 8
};

export function applicationsSummary(rows: readonly HireAdminApplication[]) {
  const perStatus = new Map<HireApplicationStatus, number>();
  for (const row of rows) perStatus.set(row.status, (perStatus.get(row.status) ?? 0) + 1);
  const counts = Object.fromEntries(
    APPLICATION_TABS.map((tab) => [
      tab,
      TAB_STATUSES[tab].reduce((sum, status) => sum + (perStatus.get(status) ?? 0), 0)
    ])
  ) as Record<ApplicationTab, number>;
  return { counts, growth_pct: { ...GROWTH_PCT } };
}

const DAY_MS = 24 * 60 * 60_000;

function addDays(day: string, days: number): string {
  return new Date(Date.parse(`${day}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);
}

const TREND_END = '2026-06-24';
/** The first day of the oldest 15-day period of the 90-day chart. */
const SERIES_START = '2026-03-12';
/** The 30-day curve in the reference picture: seven 5-day totals, the first ending on 25 May. */
const CURVE_30D = [250, 560, 480, 740, 900, 1160, 1460];
const CURVE_START = '2026-05-21';
/** Spreads a 5-day total over its days without changing the sum. The last period stays flat. */
const WITHIN_PERIOD = [-4, 2, -1, 3, 0];

/** Applications per day, from 12 Mar to 24 Jun 2026: 40 to 47 a day, then the curve above. */
const DAILY = (() => {
  const daily = new Map<string, number>();
  for (let d = 0; d < 70; d++) daily.set(addDays(SERIES_START, d), 40 + ((d * 5 + 3) % 8));
  CURVE_30D.forEach((total, period) => {
    const flat = period === CURVE_30D.length - 1;
    for (let k = 0; k < 5; k++) {
      daily.set(addDays(CURVE_START, period * 5 + k), total / 5 + (flat ? 0 : WITHIN_PERIOD[k]!));
    }
  });
  return daily;
})();

/** Days in each point: a day, five days, or fifteen days. Seven points per range. */
const PERIOD_DAYS = new Map([
  ['7d', 1],
  ['30d', 5],
  ['90d', 15]
]);

/** Seven points, each the total for the period that ends on its date. An unknown range gives 30d. */
export function applicationsTrend(range: string) {
  const period = PERIOD_DAYS.get(range) ?? 5;
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(TREND_END, -(6 - i) * period);
    let count = 0;
    for (let d = 0; d < period; d++) count += DAILY.get(addDays(date, -d)) ?? 0;
    return { date, count };
  });
}

const MAX_OPTIONS = 20;

/** Search for the Job, Recruiter and Location filters: contains on the label, sorted, at most 20. */
export function applicationOptions(kind: string, search: string) {
  const byValue = new Map<string, { value: string; label: string }>();
  for (const job of getApplicationJobs()) {
    if (kind === 'jobs') {
      byValue.set(job.job_id, {
        value: job.job_id,
        label: `${job.title} (${job.outlet_name}) · ${job.job_id}`
      });
    } else if (kind === 'recruiters') {
      const label = `${job.recruiter_name} (${job.recruiter_id})`;
      byValue.set(job.recruiter_id, { value: job.recruiter_id, label });
    } else {
      byValue.set(job.location, { value: job.location, label: job.location });
    }
  }
  const needle = search.trim().toLowerCase();
  return [...byValue.values()]
    .filter((option) => option.label.toLowerCase().includes(needle))
    .sort((a, b) => a.label.localeCompare(b.label, 'en'))
    .slice(0, MAX_OPTIONS);
}
