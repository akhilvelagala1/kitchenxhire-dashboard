import { apiClient } from '@/shared/api/apiClient';
import type { Job, ListQuery } from '@/shared/api/types';
import type {
  HireApplicationsReport,
  HireJobsReport,
  HireRecruitersReport,
  HireReportsOverview,
  HireUsersReport,
  ReportRange
} from '../schemas/adminReports';
import type {
  ReportsApplicationRow,
  ReportsExportDetail,
  ReportsFilterOptions,
  ReportsHiredRow,
  ReportsJobRow,
  ReportsRecordsQuery,
  ReportsRejectedRow,
  ReportsTimeToHire
} from '../schemas/adminReportsDrilldown';

const BASE = '/hire/admin/reports';

/** The query string of one stat-card list. Empty values never reach the URL (apiClient drops them). */
function recordsQuery(query: ReportsRecordsQuery, filterParam: string): ListQuery {
  return {
    range: query.range,
    page: query.page,
    page_size: query.pageSize,
    search: query.search,
    [filterParam]: query.filter,
    sort: query.sort ?? undefined,
    order: query.sort ? query.order : undefined
  };
}

/** `{ range }` alone is the Overview. With a card open it also names the card and what was typed or chosen in it. */
function exportBody(range: ReportRange, detail?: ReportsExportDetail) {
  if (!detail) return { range };
  return {
    range,
    metric: detail.metric,
    ...(detail.search ? { search: detail.search } : {}),
    ...(detail.filter ? { filter: detail.filter } : {})
  };
}

export const adminReportsApi = {
  /** Every number on the Overview tab for the window, counted back from the server's today. */
  overview: (range: ReportRange) =>
    apiClient.get<HireReportsOverview>(`${BASE}/overview`, { range }),

  /** Every number on the Jobs Report tab for the window, counted back from the server's today. */
  jobsReport: (range: ReportRange) => apiClient.get<HireJobsReport>(`${BASE}/jobs`, { range }),

  /** Every number on the Applications Report tab for the window, counted back from the server's today. */
  applicationsReport: (range: ReportRange) =>
    apiClient.get<HireApplicationsReport>(`${BASE}/applications`, { range }),

  /** Every number on the Users Report tab for the window, counted back from the server's today. */
  usersReport: (range: ReportRange) => apiClient.get<HireUsersReport>(`${BASE}/users`, { range }),

  /** Every number on the Recruiter Report tab for the window, counted back from the server's today. */
  recruitersReport: (range: ReportRange) =>
    apiClient.get<HireRecruitersReport>(`${BASE}/recruiters`, { range }),

  /** The Jobs Posted card's list: jobs posted in the window. `filter` is a job category. */
  jobsPostedRecords: (query: ReportsRecordsQuery) =>
    apiClient.list<ReportsJobRow>(`${BASE}/overview/jobs`, recordsQuery(query, 'job_category')),

  /** The Applications card's list: applications received in the window. `filter` is a status. */
  applicationRecords: (query: ReportsRecordsQuery) =>
    apiClient.list<ReportsApplicationRow>(
      `${BASE}/overview/applications`,
      recordsQuery(query, 'status')
    ),

  /** The Hired card's list: hires made in the window. `filter` is an outlet. */
  hiredRecords: (query: ReportsRecordsQuery) =>
    apiClient.list<ReportsHiredRow>(`${BASE}/overview/hired`, recordsQuery(query, 'outlet')),

  /** The Rejected card's list: rejections made in the window. `filter` is a rejection reason. */
  rejectedRecords: (query: ReportsRecordsQuery) =>
    apiClient.list<ReportsRejectedRow>(`${BASE}/overview/rejected`, recordsQuery(query, 'reason')),

  /** How the Avg. Time to Hire card's number is made up, for the window. */
  timeToHire: (range: ReportRange) =>
    apiClient.get<ReportsTimeToHire>(`${BASE}/overview/time-to-hire`, { range }),

  /** The choices of the category, outlet and rejection reason filters. */
  filterOptions: () => apiClient.get<ReportsFilterOptions>(`${BASE}/overview/filter-options`),

  /** Starts a CSV export of the same window, or of the open stat card's view; the job is polled like the other exports. */
  exportOverview: (range: ReportRange, detail?: ReportsExportDetail) =>
    apiClient.post<Job>(`${BASE}/exports`, exportBody(range, detail))
};
