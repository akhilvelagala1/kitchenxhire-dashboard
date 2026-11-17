/**
 * The read side of the Businesses mock: the list query (filter, sort, page) that the list and the
 * export share, and the dashboard numbers around it.
 */
import { toIstIso, type HireAdminBusiness } from './businessesMockData.ts';

interface BusinessFilters {
  tab?: string;
  status?: string;
  business_type?: string;
  verification?: string;
  city?: string;
  search?: string;
  joined?: string;
}

export interface BusinessesQuery extends BusinessFilters {
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
export function pickBusinessFilters(source: Record<string, unknown>): BusinessFilters {
  const out: BusinessFilters = {};
  for (const key of FILTER_KEYS) {
    const value = source[key];
    if (typeof value === 'string' && value.trim() !== '') out[key] = value.trim();
  }
  return out;
}

const DAY_MS = 24 * 60 * 60_000;
const JOINED_DAYS: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90 };
const END_OF_TODAY_MS = Date.parse('2024-06-25T00:00:00+05:30');

/** Tabs: Active / Inactive exact status. Under Review and Suspended sit in All only. */
function inTab(tab: string | undefined, row: HireAdminBusiness): boolean {
  if (tab === 'active' || tab === 'inactive') return row.status === tab;
  return true;
}

/** Every filter combines with the others (intersection). */
export function filterBusinesses(
  rows: readonly HireAdminBusiness[],
  f: BusinessFilters
): HireAdminBusiness[] {
  const days = f.joined ? JOINED_DAYS[f.joined] : undefined;
  const from = days === undefined ? '' : toIstIso(END_OF_TODAY_MS - days * DAY_MS);
  const to = toIstIso(END_OF_TODAY_MS);
  const status = f.status && f.status !== 'all' ? f.status : undefined;
  const type = f.business_type && f.business_type !== 'all' ? f.business_type : undefined;
  const verification = f.verification && f.verification !== 'all' ? f.verification : undefined;
  const needle = f.search?.toLowerCase();
  return rows.filter((r) => {
    if (!inTab(f.tab, r)) return false;
    if (status && r.status !== status) return false;
    if (type && r.business_type !== type) return false;
    if (verification && r.verification !== verification) return false;
    if (f.city && r.city !== f.city) return false;
    if (days !== undefined && (r.joined_at < from || r.joined_at >= to)) return false;
    if (!needle) return true;
    return [r.business_name, r.owner_name, r.area, r.city, r.business_id, r.phone, r.email].some(
      (v) => v.toLowerCase().includes(needle)
    );
  });
}

const SORTS = ['joined_at', 'business_name', 'business_id'] as const;
type SortKey = (typeof SORTS)[number];

const compare = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

/** Sorts by join date, newest first (the default); pages are 1-based, 10 by default. */
export function listBusinesses(rows: readonly HireAdminBusiness[], q: BusinessesQuery) {
  const sort: SortKey = SORTS.find((s) => s === q.sort) ?? 'joined_at';
  const dir = q.order === 'asc' ? 1 : -1;
  const sorted = filterBusinesses(rows, q).sort((a, b) => {
    const byName =
      sort === 'business_name' ? a.business_name.localeCompare(b.business_name, 'en') : 0;
    return (byName || compare(a[sort], b[sort]) || compare(a.business_id, b.business_id)) * dir;
  });
  const page = Math.max(1, Math.floor(q.page ?? 1) || 1);
  const rawSize = Math.floor(q.page_size ?? 10) || 10;
  const pageSize = Math.min(100, Math.max(1, rawSize));
  return {
    items: sorted.slice((page - 1) * pageSize, page * pageSize),
    meta: { page, page_size: pageSize, total: sorted.length }
  };
}

const GROWTH_PCT = {
  total: 14,
  active: 12,
  inactive: -5,
  outlets: 18,
  active_outlets: 16,
  warehouses: 9
};

export function businessesSummary(rows: readonly HireAdminBusiness[]) {
  const summary = {
    total: rows.length,
    active: 0,
    inactive: 0,
    outlets: 0,
    active_outlets: 0,
    warehouses: 0
  };
  for (const row of rows) {
    summary.outlets += row.outlets;
    if (row.status === 'active') {
      summary.active += 1;
      summary.active_outlets += row.outlets;
    } else if (row.status === 'inactive') {
      summary.inactive += 1;
    }
    if (row.business_type === 'Warehouse') summary.warehouses += 1;
  }
  return { ...summary, growth_pct: { ...GROWTH_PCT } };
}

export function businessLocations(rows: readonly HireAdminBusiness[]) {
  return [...new Set(rows.map((r) => r.city).filter((city) => city !== ''))]
    .sort((a, b) => a.localeCompare(b, 'en'))
    .map((city) => ({ value: city, label: city }));
}

function addDays(day: string, days: number): string {
  return new Date(Date.parse(`${day}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);
}

const TREND_END = '2024-06-24';
const ANCHORS: [string, number][] = [
  ['2024-03-26', 420],
  ['2024-04-20', 480],
  ['2024-05-15', 540],
  ['2024-06-01', 590],
  [TREND_END, 642]
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

const STEP_DAYS = new Map([
  ['7d', 1],
  ['30d', 5],
  ['90d', 15]
]);

/** Kept for the mock trend route; the Businesses UI no longer shows a chart. */
export function businessesTrend(range: string) {
  const step = STEP_DAYS.get(range) ?? 5;
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(TREND_END, -(6 - i) * step);
    return { date, count: LEVELS.get(date) ?? 0 };
  });
}
