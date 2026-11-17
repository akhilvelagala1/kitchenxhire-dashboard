import type { Paginated } from '@/shared/api/types';
import type { Column } from '@/shared/components/DataTable';
import { adminReportsApi } from '../api/adminReportsApi';
import { APPLICATION_STATUS_LABELS, HIRE_APPLICATION_STATUSES } from '../schemas/adminApplication';
import type {
  ReportsApplicationRow,
  ReportsFilterOptions,
  ReportsHiredRow,
  ReportsJobRow,
  ReportsRecordsMetric,
  ReportsRecordsQuery,
  ReportsRejectedRow
} from '../schemas/adminReportsDrilldown';
import {
  applicationsColumns,
  hiredColumns,
  jobsPostedColumns,
  rejectedColumns
} from './reportsRecordsColumns';

/** One entry of a filter select. */
export interface ReportsFilterChoice {
  value: string;
  label: string;
}

/**
 * Everything that differs between the four stat-card lists. ReportsRecordsCard reads only this, so
 * one card draws all four; the four objects are defined further down in this file.
 */
export interface ReportsRecordsConfig<Row> {
  metric: ReportsRecordsMetric;
  /** The card title without the count: `Jobs Posted`. The count is added from the answer. */
  title: string;
  /** The grey line under the title. */
  description: string;
  /** Plural, lower case, for the pager footer: `jobs`, `hired candidates`. */
  noun: string;
  searchPlaceholder: string;
  /** What the filter select says while nothing is chosen, and its accessible name: `All Jobs`. */
  filterAllLabel: string;
  /** The choices after the "all" entry. `options` is undefined until the filter options have loaded. */
  filterChoices: (options: ReportsFilterOptions | undefined) => ReportsFilterChoice[];
  columns: Column<Row>[];
  getRowId: (row: Row) => string;
  fetch: (query: ReportsRecordsQuery) => Promise<Paginated<Row>>;
  /** The table's empty state title, for a list with no rows. */
  emptyTitle: string;
}

/** Choices for a filter made of names from the data: each name is its own value and label. */
function namesAsChoices(names: string[] | undefined): ReportsFilterChoice[] {
  return (names ?? []).map((name) => ({ value: name, label: name }));
}

/** The six application statuses. They are fixed, so they never wait for the filter options. */
const STATUS_CHOICES: ReportsFilterChoice[] = HIRE_APPLICATION_STATUSES.map((status) => ({
  value: status,
  label: APPLICATION_STATUS_LABELS[status]
}));

/** The Jobs Posted card: the jobs posted in the window. Its filter is a job category. */
export const JOBS_POSTED_CONFIG: ReportsRecordsConfig<ReportsJobRow> = {
  metric: 'jobs_posted',
  title: 'Jobs Posted',
  description: 'All jobs created by recruiters (restaurants / outlets) in the selected period.',
  noun: 'jobs',
  searchPlaceholder: 'Search jobs...',
  filterAllLabel: 'All Jobs',
  filterChoices: (options) => namesAsChoices(options?.job_categories),
  columns: jobsPostedColumns,
  getRowId: (row) => row.job_id,
  fetch: (query) => adminReportsApi.jobsPostedRecords(query),
  emptyTitle: 'No jobs found'
};

/** The Applications card: the applications received in the window. Its filter is a status. */
export const APPLICATIONS_CONFIG: ReportsRecordsConfig<ReportsApplicationRow> = {
  metric: 'applications',
  title: 'Applications',
  description: 'All job applications submitted by users in the selected period.',
  noun: 'applications',
  searchPlaceholder: 'Search applications...',
  filterAllLabel: 'All Status',
  filterChoices: () => STATUS_CHOICES,
  columns: applicationsColumns,
  getRowId: (row) => row.application_id,
  fetch: (query) => adminReportsApi.applicationRecords(query),
  emptyTitle: 'No applications found'
};

/**
 * The Hired card: the hires made in the window. Its filter is an outlet. The row is keyed by its
 * application id, because one candidate can be hired for more than one job.
 */
export const HIRED_CONFIG: ReportsRecordsConfig<ReportsHiredRow> = {
  metric: 'hired',
  title: 'Hired Candidates',
  description: 'Users who have been hired by recruiters in the selected period.',
  noun: 'hired candidates',
  searchPlaceholder: 'Search hired candidates...',
  filterAllLabel: 'All Outlets',
  filterChoices: (options) => namesAsChoices(options?.outlets),
  columns: hiredColumns,
  getRowId: (row) => row.application_id,
  fetch: (query) => adminReportsApi.hiredRecords(query),
  emptyTitle: 'No hired candidates found'
};

/** The Rejected card: the rejections made in the window. Its filter is a rejection reason. */
export const REJECTED_CONFIG: ReportsRecordsConfig<ReportsRejectedRow> = {
  metric: 'rejected',
  title: 'Rejected Applications',
  description: 'Applications that were not selected by recruiters in the selected period.',
  noun: 'rejected applications',
  searchPlaceholder: 'Search rejected applications...',
  filterAllLabel: 'All Reasons',
  filterChoices: (options) => namesAsChoices(options?.rejection_reasons),
  columns: rejectedColumns,
  getRowId: (row) => row.application_id,
  fetch: (query) => adminReportsApi.rejectedRecords(query),
  emptyTitle: 'No rejected applications found'
};
