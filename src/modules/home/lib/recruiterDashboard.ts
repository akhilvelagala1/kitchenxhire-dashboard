import { countRecruiterJobsPosted } from './recruiterPostedJobsStore';
import type {
  RecruiterApplicationStatusFilter,
  RecruiterInboundApplication,
  RecruiterMyApplicationsTab
} from '../schemas/recruiterApplication';
import { RECRUITER_APPLICATIONS_PAGE_SIZE } from '../schemas/recruiterApplication';

export type RecruiterDateFilter = '7d' | '30d' | '90d' | 'all';

export interface RecruiterApplicationQuery {
  search: string;
  jobId: string;
  status: RecruiterApplicationStatusFilter;
  dateRange: RecruiterDateFilter;
  page: number;
  location?: string;
  tab?: RecruiterMyApplicationsTab;
}

export interface RecruiterDashboardMetrics {
  jobsPosted: number;
  totalApplicants: number;
  selectedHired: number;
  rejected: number;
  underReview: number;
}

export function isRecruiterApplicationAccepted(status: RecruiterInboundApplication['status']) {
  return status === 'selected' || status === 'hired';
}

export function isRecruiterApplicationUnderReview(status: RecruiterInboundApplication['status']) {
  return !isRecruiterApplicationAccepted(status) && status !== 'rejected';
}

function withinDateRange(appliedAt: string, range: RecruiterDateFilter): boolean {
  if (range === 'all') return true;
  const applied = new Date(appliedAt).getTime();
  const now = Date.now();
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  return now - applied <= days * 24 * 60 * 60 * 1000;
}

function matchesTab(row: RecruiterInboundApplication, tab: RecruiterApplicationQuery['tab']) {
  if (!tab || tab === 'all') return true;
  if (tab === 'accepted') return isRecruiterApplicationAccepted(row.status);
  if (tab === 'rejected') return row.status === 'rejected';
  return isRecruiterApplicationUnderReview(row.status);
}

export function filterRecruiterApplications(
  rows: RecruiterInboundApplication[],
  query: Omit<RecruiterApplicationQuery, 'page'>
): RecruiterInboundApplication[] {
  const term = query.search.trim().toLowerCase();
  return rows.filter((row) => {
    if (query.jobId !== 'all' && row.jobId !== query.jobId) return false;
    if (query.status !== 'all' && row.status !== query.status) return false;
    if (query.location && query.location !== 'all' && row.location !== query.location) return false;
    if (!matchesTab(row, query.tab)) return false;
    if (!withinDateRange(row.appliedAt, query.dateRange)) return false;
    if (!term) return true;
    return (
      row.candidateName.toLowerCase().includes(term) || row.jobTitle.toLowerCase().includes(term)
    );
  });
}

export function paginateRecruiterApplications<T>(rows: T[], page: number, pageSize: number) {
  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    page: safePage,
    totalPages,
    total,
    slice: rows.slice(start, start + pageSize),
    rangeStart: total === 0 ? 0 : start + 1,
    rangeEnd: Math.min(start + pageSize, total)
  };
}

export function computeRecruiterMetrics(
  rows: RecruiterInboundApplication[],
  accountId: string
): RecruiterDashboardMetrics {
  return {
    jobsPosted: countRecruiterJobsPosted(accountId),
    totalApplicants: rows.length,
    selectedHired: rows.filter((r) => isRecruiterApplicationAccepted(r.status)).length,
    rejected: rows.filter((r) => r.status === 'rejected').length,
    underReview: rows.filter((r) => isRecruiterApplicationUnderReview(r.status)).length
  };
}

export function defaultRecruiterQuery(): RecruiterApplicationQuery {
  return {
    search: '',
    jobId: 'all',
    status: 'all',
    dateRange: '30d',
    page: 1,
    location: 'all'
  };
}

export function defaultRecruiterMyApplicationsQuery(): RecruiterApplicationQuery {
  return {
    ...defaultRecruiterQuery(),
    tab: 'all',
    page: 1
  };
}

export function listRecruiterApplicationLocations(rows: RecruiterInboundApplication[]) {
  const set = new Set<string>();
  for (const row of rows) {
    if (row.location?.trim()) set.add(row.location.trim());
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

export { RECRUITER_APPLICATIONS_PAGE_SIZE };
