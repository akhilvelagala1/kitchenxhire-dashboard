import type { SortDirection } from '@/shared/api/types';
import type { HireApplicationStatus } from './adminApplication';
import type { ReportKpiKey, ReportRange } from './adminReports';

/*
 * What sits behind the five stat cards of the Reports Overview. Click a card and the page shows the
 * records that make up its number for the same window (Avg. Time to Hire shows how its average is
 * made up). Invariants the backend must keep, with no search or filter: each list's `meta.total` is
 * the card's `kpis[...].value` for the same `range`; `average_days` and `change_pct` of the time to
 * hire are the card's `avg_time_to_hire_days`.
 */

/** The five stat cards, in the order they are drawn. The value is also the `metric` URL parameter. */
export const REPORT_KPI_KEYS = [
  'jobs_posted',
  'applications',
  'hired',
  'rejected',
  'avg_time_to_hire_days'
] as const satisfies readonly ReportKpiKey[];

/** The four cards that open a list. Avg. Time to Hire opens the analysis view instead. */
export type ReportsRecordsMetric = Exclude<ReportKpiKey, 'avg_time_to_hire_days'>;

/** Rows per page on all four lists, as in the reference picture (297 pages for 1,482 jobs). */
export const REPORTS_RECORDS_PAGE_SIZE = 5;

/** The columns each list can be sorted by on the server. With no `sort`, the newest comes first. */
export const REPORTS_SORT_KEYS = {
  jobs_posted: ['posted_at', 'applications_count'],
  applications: ['applied_at'],
  hired: ['hired_at'],
  rejected: ['rejected_at']
} as const satisfies Record<ReportsRecordsMetric, readonly string[]>;

/** One job posted inside the window. */
export interface ReportsJobRow {
  job_id: string;
  title: string;
  /** Who posted it. */
  recruiter_name: string;
  outlet_name: string;
  /** ISO timestamp, India time. */
  posted_at: string;
  applications_count: number;
}

/** One application received inside the window. */
export interface ReportsApplicationRow {
  application_id: string;
  candidate_name: string;
  job_title: string;
  outlet_name: string;
  /** ISO timestamp, India time. */
  applied_at: string;
  status: HireApplicationStatus;
}

/** One hire made inside the window, by `hired_at`. */
export interface ReportsHiredRow {
  application_id: string;
  candidate_id: string;
  candidate_name: string;
  job_title: string;
  /** The recruiter who made the hire. */
  recruiter_name: string;
  outlet_name: string;
  /** ISO timestamp, India time. */
  hired_at: string;
}

/** One rejection made inside the window, by `rejected_at`. */
export interface ReportsRejectedRow {
  application_id: string;
  candidate_name: string;
  job_title: string;
  outlet_name: string;
  /** ISO timestamp, India time. */
  rejected_at: string;
  /** Null when none was recorded; the screen then says "Not recorded". Never made up. */
  rejection_reason: string | null;
}

/** What the screen asks of one list. The API takes `pageSize` as `page_size`, and `filter` under the list's own name. */
export interface ReportsRecordsQuery {
  range: ReportRange;
  /** 1-based. */
  page: number;
  pageSize: number;
  /** Empty for no search. */
  search: string;
  /** The list's one filter: a job category, a status, an outlet or a rejection reason. Empty for all. */
  filter: string;
  /** One of REPORTS_SORT_KEYS for the list, or null for newest first. */
  sort: string | null;
  order: SortDirection;
}

/** The choices of the three filters whose values are data. Statuses come from the application schema. */
export interface ReportsFilterOptions {
  job_categories: string[];
  outlets: string[];
  rejection_reasons: string[];
}

/** One sample of the time to hire trend, dated by the day it ends (same dates as the Hiring Trend). */
export interface TimeToHireTrendPoint {
  /** YYYY-MM-DD, India time. */
  date: string;
  /** Null when nobody had been hired by then. */
  average_days: number | null;
}

interface TimeToHireCategory {
  /** The job category, as in Top Job Categories. */
  label: string;
  average_days: number;
  hires: number;
}

/**
 * How the average time to hire is made up. Time to hire is the days from an application's
 * `applied_at` to its `hired_at`, averaged over the applications hired inside the window. An
 * application missing either timestamp is left out, and `hires_counted` says how many are in.
 */
export interface ReportsTimeToHire {
  range: { from: string; to: string };
  /** Days with one decimal. Null when nobody was hired in the window. */
  average_days: number | null;
  /** Percent change against the previous window of the same length. Null when that one had no hires. */
  change_pct: number | null;
  hires_counted: number;
  trend: TimeToHireTrendPoint[];
  by_category: TimeToHireCategory[];
}

/** What the header Export sends while a stat card is open: that card's view, not the Overview. */
export interface ReportsExportDetail {
  metric: ReportKpiKey;
  /** Empty for no search. */
  search: string;
  /** Empty for all. Same meaning as `ReportsRecordsQuery.filter`. */
  filter: string;
}
