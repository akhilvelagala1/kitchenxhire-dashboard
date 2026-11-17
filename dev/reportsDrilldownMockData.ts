/**
 * The records behind the stat cards of the Reports Overview, for the dev mock API only. There is no
 * backend yet, so this stands in for GET /hire/admin/reports/overview/{jobs,applications,hired,rejected}
 * of kitchenxhire-backend-go, the way every other admin screen of the mock does. Jobs are built here;
 * applications, hires and rejections are one ledger per range in reportsDrilldownLedger.ts.
 *
 * Nothing here is random and nothing reads the clock. Row 0 is the newest, dates run back evenly across
 * the window of reportsOverview(range), and a range always gives the same rows. Totals come from the
 * Overview, so a card and its list agree: 1,482 jobs posted in the 30-day window is 1,482 rows, split
 * into the categories of Top Job Categories to the job. Names, outlets and recruiters are the ones the
 * Applications mock already uses, so a row looks like the rest of the app. The types repeat
 * src/modules/hire-admin/schemas/adminReportsDrilldown.ts, because dev/ never imports src/.
 */
import {
  getApplicationsStore,
  toIstIso,
  type HireApplicationStatus
} from './applicationsMockData.ts';
import { reportsOverview, type ReportRange } from './reportsMockData.ts';

export interface ReportsJobRow {
  job_id: string;
  title: string;
  recruiter_name: string;
  outlet_name: string;
  posted_at: string;
  applications_count: number;
}

export interface ReportsApplicationRow {
  application_id: string;
  candidate_name: string;
  job_title: string;
  outlet_name: string;
  applied_at: string;
  status: HireApplicationStatus;
}

export interface ReportsHiredRow {
  application_id: string;
  candidate_id: string;
  candidate_name: string;
  job_title: string;
  recruiter_name: string;
  outlet_name: string;
  hired_at: string;
}

export interface ReportsRejectedRow {
  application_id: string;
  candidate_name: string;
  job_title: string;
  outlet_name: string;
  rejected_at: string;
  rejection_reason: string | null;
}

/** The reasons a rejection can name. A rejection with none recorded has null, never a made-up reason. */
export const REJECTION_REASONS = [
  'Skills not matched',
  'Insufficient experience',
  'Profile not suitable',
  'Not available for shift',
  'Other'
] as const;

export const MINUTE = 60_000;
export const DAY = 24 * 60 * MINUTE;

/** The newest job of the Jobs screen. Ids fall from here, so JOB10293 is the newest job in every range. */
const NEWEST_JOB = 10293;
const GOLDEN = 0.6180339887;

/**
 * Three fractions for every record that stay evenly spread even when looked at together (Roberts' R3
 * sequence), so the category, the reason and the time it took of a record never move in step.
 */
const R3 = [0.8191725134, 0.6710436067, 0.5497004779] as const;
type Axis = 0 | 1 | 2;

/** The fraction of record `k` on one of the three axes, in [0, 1). */
export const quasi = (k: number, axis: Axis): number => (0.5 + R3[axis] * (k + 1)) % 1;

export const pad = (n: number) => String(n).padStart(5, '0');
export const toMinute = (ms: number) => Math.round(ms / MINUTE) * MINUTE;

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

/**
 * The ranks 0 to count - 1, each exactly once, in a fixed order that keeps neighbours far apart: a step
 * of about 0.618 of the count, nudged until it shares no factor with it. A category or status read off the
 * rank therefore gets exactly its share, and every page shows a mix.
 */
export function scatter(count: number): number[] {
  let step = Math.max(1, Math.round(count * GOLDEN));
  while (gcd(step, count) !== 1) step += 1;
  return Array.from({ length: count }, (_, i) => (i * step) % count);
}

/** The point in [0, 1) that stands for rank `rank` of `count`. */
export const ranked = (rank: number, count: number) => (rank + 0.5) / count;

/**
 * Which weighted bucket a point in [0, 1) falls in. With a point from `ranked` and weights that add up to
 * the count, every bucket gets exactly its weight.
 */
export function bucketOf(point: number, weights: readonly number[]): number {
  let left = point * weights.reduce((sum, weight) => sum + weight, 0);
  for (const [i, weight] of weights.entries()) {
    if (left < weight) return i;
    left -= weight;
  }
  return weights.length - 1;
}

/** Builds the data of a range once, on first use. */
export function perRange<T>(build: (range: ReportRange) => T): (range: ReportRange) => T {
  const built = new Map<ReportRange, T>();
  return (range) => {
    if (!built.has(range)) built.set(range, build(range));
    return built.get(range) as T;
  };
}

export interface TimeWindow {
  start: number;
  end: number;
}

/**
 * The window of a range as instants, India time: midnight of its first day to the evening of its last,
 * the mock clock of the Applications mock. Every record of a range falls between the two.
 */
export function windowOf(range: ReportRange): TimeWindow {
  const { from, to } = reportsOverview(range).range;
  return { start: Date.parse(`${from}T00:00:00+05:30`), end: Date.parse(`${to}T18:00:00+05:30`) };
}

/** `count` instants spread evenly across the window, newest first, none on its edge, to the minute. */
export function evenly(count: number, win: TimeWindow): number[] {
  const step = (win.end - win.start) / count;
  return Array.from({ length: count }, (_, k) => toMinute(win.end - (k + 0.5) * step));
}

export interface Candidate {
  id: string;
  name: string;
}

interface Vocabulary {
  /** Every outlet the records use. */
  outlets: readonly string[];
  candidateAt: (k: number) => Candidate;
  outletAt: (k: number) => string;
  recruiterAt: (k: number) => string;
}

/** Reads `items` in a fixed scrambled order, wrapping round: every item comes up equally often, neighbours differ. */
function spread<T>(items: readonly T[]): (k: number) => T {
  const order = scatter(items.length);
  return (k) => items[order[k % items.length]];
}

let cachedVocabulary: Vocabulary | undefined;

/**
 * Who and where, taken from the Applications mock so a candidate, an outlet or a recruiter reads the
 * same on every screen: its candidates (id and name), the outlets of its jobs and their recruiters.
 */
export function getVocabulary(): Vocabulary {
  if (cachedVocabulary) return cachedVocabulary;
  const rows = getApplicationsStore();
  const names = new Map<string, string>();
  for (const row of rows) {
    if (!names.has(row.candidate_id)) names.set(row.candidate_id, row.candidate_name);
  }
  const candidates = [...names].map(([id, name]) => ({ id, name }));
  const outlets = [...new Set(rows.map((row) => row.outlet_name))];
  const recruiters = [...new Set(rows.map((row) => row.recruiter_name))];
  cachedVocabulary = {
    outlets,
    candidateAt: spread(candidates),
    outletAt: spread(outlets),
    recruiterAt: spread(recruiters)
  };
  return cachedVocabulary;
}

/** The category of the jobs that Top Job Categories leaves out, as the Jobs mock calls it. */
const UNLISTED_CATEGORY = 'Restaurant Manager';

/**
 * Job titles by category: the titles of the Jobs mock, plus the ones of Bakery Assistant, a category the
 * Overview lists and the Jobs mock has no jobs for. A title belongs to one category only.
 */
const TITLES: Record<string, readonly string[]> = {
  'Cook / Chef': ['Cook / Chef', 'Sous Chef', 'Line Cook'],
  'Kitchen Helper': ['Kitchen Helper', 'Commis'],
  'Cleaning & Stewarding': ['Cleaning & Stewarding', 'Steward'],
  'Delivery & Store Support': ['Delivery & Store Support', 'Store Assistant'],
  'Bakery Assistant': ['Bakery Assistant', 'Pastry Helper'],
  Others: ['General Staff', 'Trainee'],
  [UNLISTED_CATEGORY]: ['Restaurant Manager', 'Outlet Manager']
};

const CATEGORY_OF_TITLE = new Map(
  Object.entries(TITLES).flatMap(([category, titles]) =>
    titles.map((title) => [title, category] as const)
  )
);

/** Every job category the records use, for the category filter: the six of Top Job Categories and the one that list leaves out. */
export const JOB_CATEGORIES = Object.keys(TITLES);

/** The category a job title belongs to, or null for a title no category has. */
export const jobCategoryOf = (title: string): string | null => CATEGORY_OF_TITLE.get(title) ?? null;

/**
 * The category of a point in [0, 1): the six of Top Job Categories in the proportion of their counts, then
 * the jobs the list leaves out (it shows the top ones only, so its counts add up to less than the jobs).
 */
export function categoryPicker(range: ReportRange): (point: number) => string {
  const { top_categories: top, kpis } = reportsOverview(range);
  const labels = [...top.map((row) => row.label), UNLISTED_CATEGORY];
  const listed = top.reduce((sum, row) => sum + row.count, 0);
  const weights = [...top.map((row) => row.count), kpis.jobs_posted.value - listed];
  return (point) => labels[bucketOf(point, weights)];
}

export interface JobFields {
  category: string;
  title: string;
  outlet: string;
  recruiter: string;
}

/** The job of record number `index`: its title comes from its category, its outlet and recruiter from the vocabulary. */
export function jobFields(index: number, category: string): JobFields {
  const { outletAt, recruiterAt } = getVocabulary();
  const titles = TITLES[category] ?? [category];
  return {
    category,
    title: titles[index % titles.length],
    outlet: outletAt(index),
    recruiter: recruiterAt(index)
  };
}

/**
 * Every job posted in the window, newest first. The six categories get exactly the counts of Top Job
 * Categories, and the applications of the jobs come to about the applications of the window.
 */
function buildJobRows(range: ReportRange): ReportsJobRow[] {
  const { kpis } = reportsOverview(range);
  const count = kpis.jobs_posted.value;
  const perJob = kpis.applications.value / count;
  const ranks = scatter(count);
  const categoryOf = categoryPicker(range);
  return evenly(count, windowOf(range)).map((postedMs, i) => {
    const job = jobFields(i, categoryOf(ranked(ranks[i], count)));
    return {
      job_id: `JOB${pad(NEWEST_JOB - i)}`,
      title: job.title,
      recruiter_name: job.recruiter,
      outlet_name: job.outlet,
      posted_at: toIstIso(postedMs),
      applications_count: Math.round(perJob * (0.2 + (1.6 * ((i * 37) % 97)) / 97))
    };
  });
}

export const reportsJobRows = perRange(buildJobRows);
