import type { ReportRange } from '../schemas/adminReports';
import type { ReportsRecordsMetric, ReportsRecordsQuery } from '../schemas/adminReportsDrilldown';

export const adminReportsKeys = {
  all: ['hire-admin', 'reports'] as const,
  overview: (range: ReportRange) => [...adminReportsKeys.all, 'overview', range] as const,
  jobsReport: (range: ReportRange) => [...adminReportsKeys.all, 'jobs', range] as const,
  applicationsReport: (range: ReportRange) =>
    [...adminReportsKeys.all, 'applications', range] as const,
  usersReport: (range: ReportRange) => [...adminReportsKeys.all, 'users', range] as const,
  recruitersReport: (range: ReportRange) => [...adminReportsKeys.all, 'recruiters', range] as const,
  records: (metric: ReportsRecordsMetric, query: ReportsRecordsQuery) =>
    [...adminReportsKeys.all, 'records', metric, query] as const,
  timeToHire: (range: ReportRange) => [...adminReportsKeys.all, 'time-to-hire', range] as const,
  filterOptions: () => [...adminReportsKeys.all, 'filter-options'] as const
};
