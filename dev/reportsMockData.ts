/**
 * Numbers for GET /hire/admin/reports/overview in the dev mock API: the Reports & Analytics Overview for
 * the last 7, 30 or 90 days, counted back from the mock clock (24 Jun 2026, the Applications mock's
 * today). The 30-day window is the reference picture, number for number. The other two are made up and
 * keep the rules the real API keeps: the trend adds up to the KPI totals, the status slices add up to the
 * applications, and a category or location never counts more than the jobs or applications it is a share
 * of. The types repeat src/modules/hire-admin/schemas/adminReports.ts, because dev/ never imports src/.
 */
export const REPORT_RANGES = ['7d', '30d', '90d'] as const;
export type ReportRange = (typeof REPORT_RANGES)[number];

type KpiKey = 'jobs_posted' | 'applications' | 'hired' | 'rejected' | 'avg_time_to_hire_days';
type StatusKey = 'hired' | 'shortlisted' | 'under_review' | 'rejected';

interface Kpi {
  value: number;
  change_pct: number;
}

interface TrendPoint {
  date: string;
  applications: number;
  jobs: number;
  hires: number;
}

interface RankedCount {
  label: string;
  count: number;
}

interface GrowthPoint {
  month: string;
  job_seekers: number;
  recruiters: number;
}

export interface ReportsOverview {
  range: { from: string; to: string };
  kpis: Record<KpiKey, Kpi>;
  hiring_trend: TrendPoint[];
  application_status: { status: StatusKey; count: number }[];
  top_categories: RankedCount[];
  top_locations: RankedCount[];
  platform_growth: GrowthPoint[];
}

const TODAY = '2026-06-24';
const DAY_MS = 24 * 60 * 60_000;
const DAYS: Record<ReportRange, number> = { '7d': 7, '30d': 30, '90d': 90 };

function addDays(day: string, days: number): string {
  return new Date(Date.parse(`${day}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);
}

/** The window is inclusive and ends today, so 30d is 26 May to 24 Jun. */
const windowOf = (range: ReportRange) => ({ from: addDays(TODAY, 1 - DAYS[range]), to: TODAY });

/** The dates of `count` samples that are `step` days apart, the last one today. */
const every = (count: number, step: number) =>
  Array.from({ length: count }, (_, i) => addDays(TODAY, -(count - 1 - i) * step));

/** Splits `total` into whole numbers proportional to `weights`, summing to exactly `total`. */
function allocate(total: number, weights: readonly number[]): number[] {
  const sum = weights.reduce((a, b) => a + b, 0);
  const raw = weights.map((w) => (total * w) / sum);
  const out = raw.map(Math.floor);
  let left = total - out.reduce((a, b) => a + b, 0);
  const byRemainder = raw
    .map((r, i) => ({ i, frac: r - Math.floor(r) }))
    .sort((a, b) => b.frac - a.frac || a.i - b.i);
  for (const { i } of byRemainder) {
    if (left <= 0) break;
    out[i] = (out[i] ?? 0) + 1;
    left -= 1;
  }
  return out;
}

const CATEGORY_LABELS = [
  'Cook / Chef',
  'Kitchen Helper',
  'Cleaning & Stewarding',
  'Delivery & Store Support',
  'Bakery Assistant',
  'Others'
];
const LOCATION_LABELS = ['Hyderabad', 'Madhapur', 'Gachibowli', 'Banjara Hills', 'Kondapur'];

/** Platform size at each month end. The same for every window: it always shows the last six months. */
const PLATFORM_GROWTH: GrowthPoint[] = [
  { month: '2026-01', job_seekers: 9800, recruiters: 120 },
  { month: '2026-02', job_seekers: 12300, recruiters: 150 },
  { month: '2026-03', job_seekers: 15200, recruiters: 190 },
  { month: '2026-04', job_seekers: 17200, recruiters: 230 },
  { month: '2026-05', job_seekers: 20700, recruiters: 270 },
  { month: '2026-06', job_seekers: 24860, recruiters: 312 }
];

const ranked = (labels: readonly string[], counts: readonly number[]): RankedCount[] =>
  labels.map((label, i) => ({ label, count: counts[i]! }));

function trend(
  dates: readonly string[],
  applications: readonly number[],
  jobs: readonly number[],
  hires: readonly number[]
): TrendPoint[] {
  return dates.map((date, i) => ({
    date,
    applications: applications[i]!,
    jobs: jobs[i]!,
    hires: hires[i]!
  }));
}

/** The 30-day Overview as drawn in the reference picture. */
const OVERVIEW_30D: ReportsOverview = {
  range: windowOf('30d'),
  kpis: {
    jobs_posted: { value: 1482, change_pct: 12 },
    applications: { value: 8672, change_pct: 18 },
    hired: { value: 590, change_pct: 15 },
    rejected: { value: 1036, change_pct: -5 },
    avg_time_to_hire_days: { value: 6.8, change_pct: -22 }
  },
  hiring_trend: trend(
    [
      '2026-05-26',
      '2026-05-30',
      '2026-06-03',
      '2026-06-07',
      '2026-06-11',
      '2026-06-15',
      '2026-06-19',
      '2026-06-24'
    ],
    [469, 816, 1050, 891, 1125, 1238, 1241, 1842],
    [81, 142, 150, 166, 212, 188, 231, 312],
    [14, 42, 74, 70, 88, 81, 97, 124]
  ),
  application_status: [
    { status: 'hired', count: 590 },
    { status: 'shortlisted', count: 4960 },
    { status: 'under_review', count: 2086 },
    { status: 'rejected', count: 1036 }
  ],
  top_categories: ranked(CATEGORY_LABELS, [428, 276, 198, 142, 118, 86]),
  top_locations: ranked(LOCATION_LABELS, [3248, 1286, 982, 768, 646]),
  platform_growth: PLATFORM_GROWTH
};

/** What a made-up window is built from. Weights are relative sizes, the totals come from the KPIs. */
interface Plan {
  kpis: Record<KpiKey, Kpi>;
  dates: readonly string[];
  trend: { applications: number[]; jobs: number[]; hires: number[] };
  /** How the applications that are neither hired nor rejected split: shortlisted, under review. */
  open: [number, number];
  /** What the listed categories add up to out of the jobs posted, and the locations out of the applications. */
  listedJobs: number;
  listedApplications: number;
  categories: number[];
  locations: number[];
}

/** Hired and rejected are the same numbers in the KPIs and in the donut, as in the picture. */
function generate(range: ReportRange, plan: Plan): ReportsOverview {
  const { kpis } = plan;
  const open = allocate(
    kpis.applications.value - kpis.hired.value - kpis.rejected.value,
    plan.open
  );
  return {
    range: windowOf(range),
    kpis,
    hiring_trend: trend(
      plan.dates,
      allocate(kpis.applications.value, plan.trend.applications),
      allocate(kpis.jobs_posted.value, plan.trend.jobs),
      allocate(kpis.hired.value, plan.trend.hires)
    ),
    application_status: [
      { status: 'hired', count: kpis.hired.value },
      { status: 'shortlisted', count: open[0]! },
      { status: 'under_review', count: open[1]! },
      { status: 'rejected', count: kpis.rejected.value }
    ],
    top_categories: ranked(CATEGORY_LABELS, allocate(plan.listedJobs, plan.categories)),
    top_locations: ranked(LOCATION_LABELS, allocate(plan.listedApplications, plan.locations)),
    platform_growth: PLATFORM_GROWTH
  };
}

const OVERVIEWS: Record<ReportRange, ReportsOverview> = {
  '7d': generate('7d', {
    kpis: {
      jobs_posted: { value: 428, change_pct: 9 },
      applications: { value: 2460, change_pct: 14 },
      hired: { value: 172, change_pct: 11 },
      rejected: { value: 294, change_pct: -3 },
      avg_time_to_hire_days: { value: 6.5, change_pct: -12 }
    },
    dates: every(7, 1),
    trend: {
      applications: [312, 334, 348, 331, 369, 357, 409],
      jobs: [52, 61, 64, 55, 66, 62, 68],
      hires: [21, 25, 26, 22, 27, 24, 27]
    },
    open: [70, 30],
    listedJobs: 364,
    listedApplications: 1950,
    categories: [31, 18, 14, 11, 9, 6],
    locations: [38, 15, 11, 9, 7]
  }),
  '30d': OVERVIEW_30D,
  // Six samples 15 days apart. The last two add up to the 30-day KPIs: both windows end today.
  '90d': generate('90d', {
    kpis: {
      jobs_posted: { value: 3306, change_pct: 21 },
      applications: { value: 17940, change_pct: 26 },
      hired: { value: 1128, change_pct: 19 },
      rejected: { value: 2196, change_pct: -8 },
      avg_time_to_hire_days: { value: 7.4, change_pct: -17 }
    },
    dates: every(6, 15),
    trend: {
      applications: [1500, 1900, 2500, 3368, 3788, 4884],
      jobs: [330, 410, 500, 584, 645, 837],
      hires: [90, 120, 150, 178, 244, 346]
    },
    open: [69, 31],
    listedJobs: 2794,
    listedApplications: 14200,
    categories: [28, 19, 14, 11, 8, 6],
    locations: [74, 29, 22, 18, 15]
  })
};

export function reportsOverview(range: ReportRange): ReportsOverview {
  return OVERVIEWS[range];
}

/** The window a request names: 30d when it names none, undefined when it names one the API does not have. */
export function parseReportsRange(value: unknown): ReportRange | undefined {
  if (value === undefined || value === null) return '30d';
  return REPORT_RANGES.find((range) => range === value);
}
