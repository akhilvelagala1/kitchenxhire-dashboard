import type { HireApplicationStatus } from './adminApplication';
import type { HireJobStatus } from './adminJob';
import type { RecruiterStatus } from './adminRecruiter';
import type { UserStatus } from './adminUser';

/** The windows the date menu offers, counted back from the server's today. */
export const REPORT_RANGES = ['7d', '30d', '90d'] as const;
export type ReportRange = (typeof REPORT_RANGES)[number];

export const REPORT_RANGE_LABELS: Record<ReportRange, string> = {
  '7d': 'Last 7 Days',
  '30d': 'Last 30 Days',
  '90d': 'Last 90 Days'
};

/** How many days each window covers, today included. */
export const REPORT_RANGE_DAYS: Record<ReportRange, number> = { '7d': 7, '30d': 30, '90d': 90 };

/** The pills under the title. Every report has a screen now (UI-14). */
export const REPORT_TABS = ['overview', 'jobs', 'applications', 'users', 'recruiters'] as const;
export type ReportTab = (typeof REPORT_TABS)[number];

export const REPORT_TAB_LABELS: Record<ReportTab, string> = {
  overview: 'Overview',
  jobs: 'Jobs Report',
  applications: 'Applications Report',
  users: 'Users Report',
  recruiters: 'Recruiter Report'
};

export type ReportKpiKey =
  'jobs_posted' | 'applications' | 'hired' | 'rejected' | 'avg_time_to_hire_days';

export interface ReportKpi {
  /** The total for the window. `avg_time_to_hire_days` is in days with one decimal. */
  value: number;
  /** Percent change against the previous window of the same length. Negative when it fell. */
  change_pct: number;
}

/** One sample of the Hiring Trend chart: totals since the previous sample, dated by the day it ends. */
export interface HiringTrendPoint {
  /** YYYY-MM-DD, India time. */
  date: string;
  applications: number;
  jobs: number;
  hires: number;
}

/** The four slices of the status donut, in the order they are drawn: clockwise from the top. */
export type ApplicationStatusKey = 'hired' | 'shortlisted' | 'under_review' | 'rejected';

export interface ApplicationStatusCount {
  status: ApplicationStatusKey;
  count: number;
}

/** A ranking row: the name and how many. Shares are worked out by the screen, never sent. */
export interface RankedCount {
  label: string;
  count: number;
}

export type JobsReportKpiKey =
  'total_jobs' | 'active' | 'closed' | 'draft' | 'avg_time_to_fill_days';

/** One sample of the Jobs Posted Trend chart: jobs posted since the previous sample. */
export interface JobsPostedPoint {
  /** YYYY-MM-DD, India time. */
  date: string;
  jobs_posted: number;
}

export interface JobStatusCount {
  status: HireJobStatus;
  count: number;
}

/** One row of the Recent Jobs table: the newest first, whatever the window. */
export interface RecentJob {
  id: string;
  title: string;
  outlet: string;
  /** ISO timestamp, India time. */
  posted_on: string;
  applications: number;
  status: HireJobStatus;
}

/**
 * Everything on the Jobs Report tab for one window. Invariants the backend must keep: the status
 * counts add up to `kpis.total_jobs.value`; the trend totals add up to it too; category shares are
 * out of the same total.
 */
export interface HireJobsReport {
  range: { from: string; to: string };
  kpis: Record<JobsReportKpiKey, ReportKpi>;
  jobs_trend: JobsPostedPoint[];
  jobs_status: JobStatusCount[];
  top_categories: RankedCount[];
  recent_jobs: RecentJob[];
}

export type ApplicationsReportKpiKey =
  'total_applications' | 'shortlisted' | 'under_review' | 'hired' | 'rejected';

/** One sample of the Applications Trend chart: applications received since the previous sample. */
export interface ApplicationsTrendPoint {
  /** YYYY-MM-DD, India time. */
  date: string;
  applications: number;
}

/** One row of the Recent Applications table: the newest first, whatever the window. */
export interface RecentApplication {
  id: string;
  candidate_name: string;
  job_title: string;
  /** ISO timestamp, India time. */
  applied_on: string;
  status: HireApplicationStatus;
}

/**
 * Everything on the Applications Report tab for one window. Invariants the backend must keep: the
 * status counts add up to `kpis.total_applications.value`; the trend totals add up to it too;
 * category and location shares are out of the same total.
 */
export interface HireApplicationsReport {
  range: { from: string; to: string };
  kpis: Record<ApplicationsReportKpiKey, ReportKpi>;
  applications_trend: ApplicationsTrendPoint[];
  application_status: ApplicationStatusCount[];
  top_categories: RankedCount[];
  top_locations: RankedCount[];
  recent_applications: RecentApplication[];
}

export type UsersReportKpiKey =
  'total_users' | 'job_seekers' | 'businesses' | 'recruiters' | 'new_users';

/** Which platform persona a registered account belongs to, for the Users Report donut and table. */
export type PlatformUserType = 'job_seeker' | 'business' | 'recruiter' | 'admin';

/** One sample of the User Registration Trend chart: total registered users at the month's end, the
 * same six months as Overview's Platform Growth. */
export interface UserGrowthPoint {
  /** YYYY-MM. */
  month: string;
  users: number;
}

export interface UserTypeCount {
  type: PlatformUserType;
  count: number;
}

/** One row of the Recent Users table: the newest first, whatever the window. */
export interface RecentUser {
  id: string;
  name: string;
  user_type: PlatformUserType;
  /** ISO timestamp, India time. */
  registered_on: string;
  status: UserStatus;
}

/**
 * Everything on the Users Report tab for one window. `job_seekers`, `businesses` and `recruiters` are
 * totals as of today, the same for every window; only `new_users` and every change percentage move
 * with the selected range. Invariants the backend must keep: the type counts add up to
 * `kpis.total_users.value`; location shares are out of the same total.
 */
export interface HireUsersReport {
  range: { from: string; to: string };
  kpis: Record<UsersReportKpiKey, ReportKpi>;
  user_growth: UserGrowthPoint[];
  users_by_type: UserTypeCount[];
  top_locations: RankedCount[];
  recent_users: RecentUser[];
}

export type RecruitersReportKpiKey =
  'total_recruiters' | 'active' | 'inactive' | 'new_recruiters' | 'avg_hires_per_recruiter';

/** One sample of the Recruiter Activity Trend chart: jobs posted and hires made by recruiters since
 * the previous sample. */
export interface RecruiterActivityPoint {
  /** YYYY-MM-DD, India time. */
  date: string;
  jobs_posted: number;
  hires: number;
}

export interface RecruiterStatusCount {
  status: RecruiterStatus;
  count: number;
}

/** One row of the Recent Recruiters table: the newest first, whatever the window. */
export interface RecentRecruiter {
  id: string;
  name: string;
  outlet: string;
  /** ISO timestamp, India time. */
  joined_on: string;
  jobs_posted: number;
  hires: number;
  status: RecruiterStatus;
}

/**
 * Everything on the Recruiter Report tab for one window. `total_recruiters` is a total as of today,
 * the same for every window; only `new_recruiters` and every change percentage move with the range.
 * Invariants the backend must keep: the status counts add up to `kpis.total_recruiters.value`; the
 * leaderboard shares are out of the activity trend's total hires.
 */
export interface HireRecruitersReport {
  range: { from: string; to: string };
  kpis: Record<RecruitersReportKpiKey, ReportKpi>;
  recruiter_activity: RecruiterActivityPoint[];
  recruiter_status: RecruiterStatusCount[];
  top_recruiters: RankedCount[];
  recent_recruiters: RecentRecruiter[];
}

/** Platform size at the end of a month. */
export interface PlatformGrowthPoint {
  /** YYYY-MM. */
  month: string;
  job_seekers: number;
  recruiters: number;
}

/**
 * Everything on the Overview tab for one window. Invariants the backend must keep:
 * the status counts add up to `kpis.applications.value`; the trend totals add up to the KPI totals;
 * category shares are out of `kpis.jobs_posted.value`; location shares are out of
 * `kpis.applications.value`.
 */
export interface HireReportsOverview {
  /** The window that was counted, inclusive, YYYY-MM-DD in India time. */
  range: { from: string; to: string };
  kpis: Record<ReportKpiKey, ReportKpi>;
  hiring_trend: HiringTrendPoint[];
  application_status: ApplicationStatusCount[];
  top_categories: RankedCount[];
  top_locations: RankedCount[];
  /** The last six months, whatever the window is. */
  platform_growth: PlatformGrowthPoint[];
}
