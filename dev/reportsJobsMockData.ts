/**
 * Numbers for GET /hire/admin/reports/jobs in the dev mock API: the Jobs Report tab for the last 7,
 * 30 or 90 days, counted back from the mock clock (24 Jun 2026, the same today as reportsMockData.ts).
 * The 30-day window matches the Overview tab's own Jobs Posted total and daily split, so the two tabs
 * agree with each other. The types repeat src/modules/hire-admin/schemas/adminReports.ts, because
 * dev/ never imports src/.
 */
type ReportRange = '7d' | '30d' | '90d';
type JobStatus = 'active' | 'under_review' | 'paused' | 'closed' | 'draft';

interface Kpi {
  value: number;
  change_pct: number;
}

interface TrendPoint {
  date: string;
  jobs_posted: number;
}

interface RankedCount {
  label: string;
  count: number;
}

interface RecentJob {
  id: string;
  title: string;
  outlet: string;
  posted_on: string;
  applications: number;
  status: JobStatus;
}

export interface JobsReport {
  range: { from: string; to: string };
  kpis: Record<'total_jobs' | 'active' | 'closed' | 'draft' | 'avg_time_to_fill_days', Kpi>;
  jobs_trend: TrendPoint[];
  jobs_status: { status: JobStatus; count: number }[];
  top_categories: RankedCount[];
  recent_jobs: RecentJob[];
}

const TODAY = '2026-06-24';
const DAY_MS = 24 * 60 * 60_000;
const DAYS: Record<ReportRange, number> = { '7d': 7, '30d': 30, '90d': 90 };

function addDays(day: string, days: number): string {
  return new Date(Date.parse(`${day}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);
}

/** The window is inclusive and ends today, so 30d is 26 May to 24 Jun. */
const windowOf = (range: ReportRange) => ({ from: addDays(TODAY, 1 - DAYS[range]), to: TODAY });

const CATEGORY_LABELS = [
  'Cook / Chef',
  'Kitchen Helper',
  'Cleaning & Stewarding',
  'Delivery & Store Support',
  'Bakery Assistant',
  'Others'
];

const ranked = (labels: readonly string[], counts: readonly number[]): RankedCount[] =>
  labels.map((label, i) => ({ label, count: counts[i]! }));

function trend(dates: readonly string[], values: readonly number[]): TrendPoint[] {
  return dates.map((date, i) => ({ date, jobs_posted: values[i]! }));
}

/** The newest five jobs: the same list regardless of the window, as a real recent-activity feed would be. */
const RECENT_JOBS: RecentJob[] = [
  {
    id: 'JOB-2041',
    title: 'Cook / Chef',
    outlet: 'KitchenX - Banjara Hills',
    posted_on: '2026-06-24T10:24:00+05:30',
    applications: 42,
    status: 'active'
  },
  {
    id: 'JOB-2040',
    title: 'Kitchen Helper',
    outlet: 'KitchenX - Madhapur',
    posted_on: '2026-06-23T17:20:00+05:30',
    applications: 28,
    status: 'active'
  },
  {
    id: 'JOB-2039',
    title: 'Delivery & Store Support',
    outlet: 'KitchenX - Gachibowli',
    posted_on: '2026-06-23T11:10:00+05:30',
    applications: 16,
    status: 'closed'
  },
  {
    id: 'JOB-2038',
    title: 'Cleaning & Stewarding',
    outlet: 'KitchenX - Kondapur',
    posted_on: '2026-06-22T09:05:00+05:30',
    applications: 9,
    status: 'under_review'
  },
  {
    id: 'JOB-2037',
    title: 'Bakery Assistant',
    outlet: 'KitchenX - Hyderabad',
    posted_on: '2026-06-21T15:40:00+05:30',
    applications: 5,
    status: 'draft'
  }
];

/** The 30-day window: the same Jobs Posted total and daily split as the Overview tab's hiring trend. */
const REPORT_30D: JobsReport = {
  range: windowOf('30d'),
  kpis: {
    total_jobs: { value: 1482, change_pct: 12 },
    active: { value: 1120, change_pct: 9 },
    closed: { value: 122, change_pct: -4 },
    draft: { value: 40, change_pct: 8 },
    avg_time_to_fill_days: { value: 6.8, change_pct: -22 }
  },
  jobs_trend: trend(
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
    [81, 142, 150, 166, 212, 188, 231, 312]
  ),
  jobs_status: [
    { status: 'active', count: 1120 },
    { status: 'under_review', count: 140 },
    { status: 'paused', count: 60 },
    { status: 'closed', count: 122 },
    { status: 'draft', count: 40 }
  ],
  top_categories: ranked(CATEGORY_LABELS, [428, 276, 198, 142, 118, 86]),
  recent_jobs: RECENT_JOBS
};

const REPORT_7D: JobsReport = {
  range: windowOf('7d'),
  kpis: {
    total_jobs: { value: 428, change_pct: 9 },
    active: { value: 324, change_pct: 7 },
    closed: { value: 35, change_pct: -2 },
    draft: { value: 12, change_pct: 6 },
    avg_time_to_fill_days: { value: 6.5, change_pct: -12 }
  },
  jobs_trend: trend(
    [
      '2026-06-18',
      '2026-06-19',
      '2026-06-20',
      '2026-06-21',
      '2026-06-22',
      '2026-06-23',
      '2026-06-24'
    ],
    [52, 61, 64, 55, 66, 62, 68]
  ),
  jobs_status: [
    { status: 'active', count: 324 },
    { status: 'under_review', count: 40 },
    { status: 'paused', count: 17 },
    { status: 'closed', count: 35 },
    { status: 'draft', count: 12 }
  ],
  top_categories: ranked(CATEGORY_LABELS, [124, 80, 57, 41, 34, 25]),
  recent_jobs: RECENT_JOBS
};

const REPORT_90D: JobsReport = {
  range: windowOf('90d'),
  kpis: {
    total_jobs: { value: 3306, change_pct: 21 },
    active: { value: 2480, change_pct: 16 },
    closed: { value: 316, change_pct: -9 },
    draft: { value: 110, change_pct: 11 },
    avg_time_to_fill_days: { value: 7.4, change_pct: -17 }
  },
  jobs_trend: trend(
    [
      '2026-03-26',
      '2026-04-10',
      '2026-04-25',
      '2026-05-10',
      '2026-05-25',
      '2026-06-09',
      '2026-06-24'
    ],
    [330, 410, 500, 584, 645, 500, 337]
  ),
  jobs_status: [
    { status: 'active', count: 2480 },
    { status: 'under_review', count: 280 },
    { status: 'paused', count: 120 },
    { status: 'closed', count: 316 },
    { status: 'draft', count: 110 }
  ],
  top_categories: ranked(CATEGORY_LABELS, [955, 615, 442, 317, 264, 192]),
  recent_jobs: RECENT_JOBS
};

const REPORTS: Record<ReportRange, JobsReport> = {
  '7d': REPORT_7D,
  '30d': REPORT_30D,
  '90d': REPORT_90D
};

export function jobsReport(range: ReportRange): JobsReport {
  return REPORTS[range];
}
