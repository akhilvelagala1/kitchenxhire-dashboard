/**
 * How the four stat-card lists of the Reports Overview are searched, filtered, sorted and paged, for the dev
 * mock API only (there is no backend yet, so this stands in for kitchenxhire-backend-go). The rules are
 * those of "Reports Overview: what is behind the five stat cards" in docs/API_CONTRACT_EXPECTATIONS.md. The
 * route handler and the CSV export both go through here, so the export of a card holds exactly the rows its
 * list shows, all pages of them. Each list is described once, by a ListSpec, and the code below never
 * looks at which list it is working on.
 */
import { HIRE_APPLICATION_STATUSES } from './applicationsMockData.ts';
import {
  reportsApplicationRows,
  reportsHiredRows,
  reportsRejectedRows
} from './reportsDrilldownLedger.ts';
import {
  JOB_CATEGORIES,
  REJECTION_REASONS,
  getVocabulary,
  jobCategoryOf,
  reportsJobRows,
  type ReportsApplicationRow,
  type ReportsHiredRow,
  type ReportsJobRow,
  type ReportsRejectedRow
} from './reportsDrilldownMockData.ts';
import type { ReportRange } from './reportsMockData.ts';

export interface ListSpec<Row> {
  /** The URL parameter that carries the list's one filter. */
  filterParam: string;
  /** Every row of the window, in no order that matters here: matchingRecords orders them. */
  rows: (range: ReportRange) => readonly Row[];
  /** The row's id: what rows with an equal sort value fall back to, after the date. */
  id: (row: Row) => string;
  /** The list's date column as an instant: a list with no sort is ordered by it, newest first. */
  date: (row: Row) => number;
  /** What the filter is compared with, exactly. Null for a row that has no value. */
  filterValue: (row: Row) => string | null;
  /** Says why a filter value is not allowed. Most lists allow any value: one nobody has just matches no rows. */
  filterProblem?: (value: string) => string | undefined;
  /** The texts a search looks in, one by one. */
  searchText: (row: Row) => readonly (string | null)[];
  /** The columns the list can be sorted by, as numbers: the keys of REPORTS_SORT_KEYS in src. */
  sorts: Record<string, (row: Row) => number>;
}

const postedAt = (row: ReportsJobRow) => Date.parse(row.posted_at);
const appliedAt = (row: ReportsApplicationRow) => Date.parse(row.applied_at);
const hiredAt = (row: ReportsHiredRow) => Date.parse(row.hired_at);
const rejectedAt = (row: ReportsRejectedRow) => Date.parse(row.rejected_at);

/** Jobs Posted. The filter is the job category the title belongs to. */
export const JOBS_LIST: ListSpec<ReportsJobRow> = {
  filterParam: 'job_category',
  rows: reportsJobRows,
  id: (row) => row.job_id,
  date: postedAt,
  filterValue: (row) => jobCategoryOf(row.title),
  searchText: (row) => [row.title, row.recruiter_name, row.outlet_name, row.job_id],
  sorts: { posted_at: postedAt, applications_count: (row) => row.applications_count }
};

/** Applications. The filter is the status an application has now, one of the six. */
export const APPLICATIONS_LIST: ListSpec<ReportsApplicationRow> = {
  filterParam: 'status',
  rows: reportsApplicationRows,
  id: (row) => row.application_id,
  date: appliedAt,
  filterValue: (row) => row.status,
  filterProblem: (value) =>
    (HIRE_APPLICATION_STATUSES as readonly string[]).includes(value)
      ? undefined
      : `Status must be one of: ${HIRE_APPLICATION_STATUSES.join(', ')}.`,
  searchText: (row) => [row.candidate_name, row.job_title, row.outlet_name, row.application_id],
  sorts: { applied_at: appliedAt }
};

/** Hired. The filter is the outlet. A search also reads the candidate id, which the first column shows. */
export const HIRED_LIST: ListSpec<ReportsHiredRow> = {
  filterParam: 'outlet',
  rows: reportsHiredRows,
  id: (row) => row.application_id,
  date: hiredAt,
  filterValue: (row) => row.outlet_name,
  searchText: (row) => [
    row.candidate_name,
    row.job_title,
    row.recruiter_name,
    row.outlet_name,
    row.application_id,
    row.candidate_id
  ],
  sorts: { hired_at: hiredAt }
};

/** Rejected. The filter is the rejection reason; a rejection with none recorded matches no reason. */
export const REJECTED_LIST: ListSpec<ReportsRejectedRow> = {
  filterParam: 'reason',
  rows: reportsRejectedRows,
  id: (row) => row.application_id,
  date: rejectedAt,
  filterValue: (row) => row.rejection_reason,
  searchText: (row) => [row.candidate_name, row.job_title, row.outlet_name, row.application_id],
  sorts: { rejected_at: rejectedAt }
};

interface RecordsFilter {
  range: ReportRange;
  /** Empty or blank for no search. A case-insensitive substring of any one of the search texts. */
  search: string;
  /** Empty for all. An exact match: a value the list does not have gives no rows, not an error. */
  filter: string;
  /** A key of the spec's sorts. With none the newest comes first, and `order` means nothing. */
  sort?: string;
  order?: 'asc' | 'desc';
}

interface RecordsQuery extends RecordsFilter {
  /** 1-based. */
  page: number;
  pageSize: number;
}

const compareText = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

/**
 * Every row that matches the search and the filter (a row has to match both), newest first or in the
 * order of the named sort. Rows with an equal sort value fall back to the date, newest first, and then to
 * the id, so a row is never repeated or skipped from one page to the next.
 */
export function matchingRecords<Row>(spec: ListSpec<Row>, query: RecordsFilter): Row[] {
  const needle = query.search.trim().toLowerCase();
  const sortValue = (query.sort ? spec.sorts[query.sort] : undefined) ?? spec.date;
  const direction = query.sort && query.order === 'asc' ? 1 : -1;
  return spec
    .rows(query.range)
    .filter(
      (row) =>
        (!query.filter || spec.filterValue(row) === query.filter) &&
        (!needle || spec.searchText(row).some((text) => text?.toLowerCase().includes(needle)))
    )
    .map((row) => ({ row, key: sortValue(row), date: spec.date(row), id: spec.id(row) }))
    .sort((a, b) => (a.key - b.key) * direction || b.date - a.date || compareText(a.id, b.id))
    .map((entry) => entry.row);
}

/** One page of the matching rows, and how many rows match in all. A page past the end has no rows. */
export function queryRecords<Row>(
  spec: ListSpec<Row>,
  query: RecordsQuery
): { rows: Row[]; total: number } {
  const matching = matchingRecords(spec, query);
  const first = (query.page - 1) * query.pageSize;
  return { rows: matching.slice(first, first + query.pageSize), total: matching.length };
}

const alphabetical = (values: readonly string[]) => [...values].sort((a, b) => a.localeCompare(b));

/**
 * The choices of the three filters whose values are data, each sorted A to Z without repeats and for
 * all time, not for a window: every job category the records use, every outlet, and the reasons a rejection
 * can name. "Not recorded" is not a choice. The statuses come from the application schema, not from here.
 */
export function reportsFilterOptions() {
  return {
    job_categories: alphabetical(JOB_CATEGORIES),
    outlets: alphabetical(getVocabulary().outlets),
    rejection_reasons: alphabetical(REJECTION_REASONS)
  };
}
