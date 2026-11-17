/** CSV text for a Reports & Analytics export, served by the mock API's export-result route. */
import { APPLICATION_STATUS_LABELS } from './applicationsMockData.ts';
import {
  APPLICATIONS_LIST,
  HIRED_LIST,
  JOBS_LIST,
  REJECTED_LIST,
  matchingRecords,
  type ListSpec
} from './reportsDrilldownQuery.ts';
import type {
  ReportsApplicationRow,
  ReportsHiredRow,
  ReportsJobRow,
  ReportsRejectedRow
} from './reportsDrilldownMockData.ts';
import { reportsOverview, type ReportRange, type ReportsOverview } from './reportsMockData.ts';
import { reportsTimeToHire } from './reportsTimeToHireMockData.ts';

type Cell = string | number;

const RANGE_LABELS: Record<ReportRange, string> = {
  '7d': 'Last 7 Days',
  '30d': 'Last 30 Days',
  '90d': 'Last 90 Days'
};

const KPI_LABELS = [
  ['jobs_posted', 'Jobs Posted'],
  ['applications', 'Applications'],
  ['hired', 'Hired'],
  ['rejected', 'Rejected'],
  ['avg_time_to_hire_days', 'Avg. Time to Hire (days)']
] as const satisfies readonly (readonly [keyof ReportsOverview['kpis'], string])[];

const STATUS_LABELS: Record<ReportsOverview['application_status'][number]['status'], string> = {
  hired: 'Hired',
  shortlisted: 'Shortlisted',
  under_review: 'Under Review',
  rejected: 'Rejected'
};

/** Fields with a comma, a quote or a line break are wrapped in quotes, and quotes are doubled. */
export function csvField(value: Cell): string {
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

/** One line to a row, each ending in a line break. */
const csvText = (rows: Cell[][]) =>
  `${rows.map((row) => row.map(csvField).join(',')).join('\n')}\n`;

/** A share as the screen shows it: a percent with one decimal, so 28.9 for 428 of 1,482. */
function sharePct(count: number, total: number): string {
  return (total > 0 ? Math.round((count / total) * 1000) / 10 : 0).toFixed(1);
}

/** Two rows for each entry: its count, and its share of `base`. */
function rankingRows(
  section: string,
  entries: readonly { label: string; count: number }[],
  base: number
): Cell[][] {
  return entries.flatMap(({ label, count }) => [
    [section, label, 'count', count],
    [section, label, 'share_pct', sharePct(count, base)]
  ]);
}

/**
 * One flat table, a fact to a row: section, label, metric, value. The sections follow the screen from top
 * to bottom: the window, the five KPIs (value and change_pct), each Hiring Trend sample (applications,
 * jobs, hires), the status slices, categories and locations (count and share_pct, worked out from the
 * counts as the screen does: status out of all statuses, categories out of the jobs posted, locations out
 * of the applications) and each month of Platform Growth (job_seekers, recruiters). Numbers are plain,
 * without thousands separators, so a spreadsheet reads them as numbers.
 */
export function reportsCsv(range: ReportRange): string {
  const overview = reportsOverview(range);
  const { kpis } = overview;
  const statuses = overview.application_status.map(({ status, count }) => ({
    label: STATUS_LABELS[status],
    count
  }));
  const statusTotal = statuses.reduce((total, { count }) => total + count, 0);

  const rows: Cell[][] = [
    ['section', 'label', 'metric', 'value'],
    ['Range', RANGE_LABELS[range], 'from', overview.range.from],
    ['Range', RANGE_LABELS[range], 'to', overview.range.to],
    ...KPI_LABELS.flatMap(([key, label]) => [
      ['Key Metrics', label, 'value', kpis[key].value],
      ['Key Metrics', label, 'change_pct', kpis[key].change_pct]
    ]),
    ...overview.hiring_trend.flatMap((point) => [
      ['Hiring Trend', point.date, 'applications', point.applications],
      ['Hiring Trend', point.date, 'jobs', point.jobs],
      ['Hiring Trend', point.date, 'hires', point.hires]
    ]),
    ...rankingRows('Applications by Status', statuses, statusTotal),
    ...rankingRows('Top Job Categories', overview.top_categories, kpis.jobs_posted.value),
    ...rankingRows('Top Locations', overview.top_locations, kpis.applications.value),
    ...overview.platform_growth.flatMap((point) => [
      ['Platform Growth', point.month, 'job_seekers', point.job_seekers],
      ['Platform Growth', point.month, 'recruiters', point.recruiters]
    ])
  ];
  return csvText(rows);
}

/** The five stat cards, as the `metric` of a card export. */
const REPORTS_METRICS = KPI_LABELS.map(([key]) => key);
type ReportsMetric = (typeof REPORTS_METRICS)[number];

const isReportsMetric = (value: unknown): value is ReportsMetric =>
  REPORTS_METRICS.some((metric) => metric === value);

/** What a card export asks for: the card, and what was typed or chosen in it. */
export interface ReportsExportDetail {
  metric: ReportsMetric;
  /** Empty for no search. */
  search: string;
  /** Empty for all. Means what the list's own filter parameter means. */
  filter: string;
}

const text = (value: unknown) => (typeof value === 'string' ? value : '');

/**
 * The card a POST /exports body names. A body with no metric asks for the whole Overview, so it has no
 * detail. A metric that is none of the five, or a filter that is no application status on the Applications
 * card, is a 422: `fields` then holds the message under `metric` or `filter`, and no detail.
 */
export function readReportsExportDetail(body: Record<string, unknown>): {
  detail?: ReportsExportDetail;
  fields: Record<string, string>;
} {
  const { metric } = body;
  if (metric === undefined) return { fields: {} };
  if (!isReportsMetric(metric)) {
    return { fields: { metric: `Metric must be one of: ${REPORTS_METRICS.join(', ')}.` } };
  }
  const detail = { metric, search: text(body.search), filter: text(body.filter) };
  const problem =
    metric === 'applications' && detail.filter
      ? APPLICATIONS_LIST.filterProblem?.(detail.filter)
      : undefined;
  return problem ? { fields: { filter: problem } } : { detail, fields: {} };
}

/** A column of a card's table: the heading the screen gives it, and what is in its cells. */
type Column<Row> = readonly [heading: string, cell: (row: Row) => Cell];

const NOT_RECORDED = 'Not recorded';

/** The columns of each list as on screen, in the same order, under the same headings. The first is `#`. */
const JOB_COLUMNS: readonly Column<ReportsJobRow>[] = [
  ['#', (row) => row.job_id],
  ['Job Title', (row) => row.title],
  ['Posted By (Recruiter)', (row) => row.recruiter_name],
  ['Outlet / Restaurant', (row) => row.outlet_name],
  ['Posted On', (row) => row.posted_at],
  ['Applications', (row) => row.applications_count]
];

const APPLICATION_COLUMNS: readonly Column<ReportsApplicationRow>[] = [
  ['#', (row) => row.application_id],
  ['Applicant', (row) => row.candidate_name],
  ['Applied For', (row) => row.job_title],
  ['Outlet / Restaurant', (row) => row.outlet_name],
  ['Applied On', (row) => row.applied_at],
  ['Status', (row) => APPLICATION_STATUS_LABELS[row.status]]
];

const HIRED_COLUMNS: readonly Column<ReportsHiredRow>[] = [
  ['#', (row) => row.candidate_id],
  ['Candidate', (row) => row.candidate_name],
  ['Hired For', (row) => row.job_title],
  ['Recruited By', (row) => row.recruiter_name],
  ['Outlet / Restaurant', (row) => row.outlet_name],
  ['Hired On', (row) => row.hired_at]
];

const REJECTED_COLUMNS: readonly Column<ReportsRejectedRow>[] = [
  ['#', (row) => row.application_id],
  ['Applicant', (row) => row.candidate_name],
  ['Applied For', (row) => row.job_title],
  ['Outlet / Restaurant', (row) => row.outlet_name],
  ['Rejected On', (row) => row.rejected_at],
  ['Reason', (row) => row.rejection_reason?.trim() || NOT_RECORDED]
];

/** A heading row, then every row the list matches (not one page), newest first. */
function listCsv<Row>(
  spec: ListSpec<Row>,
  columns: readonly Column<Row>[],
  range: ReportRange,
  detail: ReportsExportDetail
): string {
  const rows = matchingRecords(spec, { range, search: detail.search, filter: detail.filter });
  return csvText([
    columns.map(([heading]) => heading),
    ...rows.map((row) => columns.map(([, cell]) => cell(row)))
  ]);
}

/**
 * The analysis behind the Avg. Time to Hire card, laid out like the Overview export (section, label, metric,
 * value): the window, the average with its change and the hires counted, each trend sample and each
 * category's days and hires. A null average is an empty cell.
 */
function timeToHireCsv(range: ReportRange): string {
  const analysis = reportsTimeToHire(range);
  const label = KPI_LABELS.find(([key]) => key === 'avg_time_to_hire_days')?.[1] ?? '';
  return csvText([
    ['section', 'label', 'metric', 'value'],
    ['Range', RANGE_LABELS[range], 'from', analysis.range.from],
    ['Range', RANGE_LABELS[range], 'to', analysis.range.to],
    ['Time to Hire', label, 'average_days', analysis.average_days ?? ''],
    ['Time to Hire', label, 'change_pct', analysis.change_pct ?? ''],
    ['Time to Hire', label, 'hires_counted', analysis.hires_counted],
    ...analysis.trend.map((point): Cell[] => [
      'Trend',
      point.date,
      'average_days',
      point.average_days ?? ''
    ]),
    ...analysis.by_category.flatMap((category): Cell[][] => [
      ['By Category', category.label, 'average_days', category.average_days],
      ['By Category', category.label, 'hires', category.hires]
    ])
  ]);
}

/**
 * The CSV of one stat card's view: for the four lists, every row that matches the search and the filter,
 * newest first, under the headings of the table on screen, with "Not recorded" for a rejection with no
 * reason; for Avg. Time to Hire, its analysis, where search and filter mean nothing.
 */
export function reportsDetailCsv(range: ReportRange, detail: ReportsExportDetail): string {
  switch (detail.metric) {
    case 'jobs_posted':
      return listCsv(JOBS_LIST, JOB_COLUMNS, range, detail);
    case 'applications':
      return listCsv(APPLICATIONS_LIST, APPLICATION_COLUMNS, range, detail);
    case 'hired':
      return listCsv(HIRED_LIST, HIRED_COLUMNS, range, detail);
    case 'rejected':
      return listCsv(REJECTED_LIST, REJECTED_COLUMNS, range, detail);
    case 'avg_time_to_hire_days':
      return timeToHireCsv(range);
  }
}
