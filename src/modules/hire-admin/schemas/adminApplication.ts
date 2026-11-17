export const HIRE_APPLICATION_STATUSES = [
  'pending_review',
  'reviewed',
  'shortlisted',
  'interview_scheduled',
  'hired',
  'rejected'
] as const;

export type HireApplicationStatus = (typeof HIRE_APPLICATION_STATUSES)[number];

export const APPLICATION_STATUS_LABELS: Record<HireApplicationStatus, string> = {
  pending_review: 'Pending Review',
  reviewed: 'Reviewed',
  shortlisted: 'Shortlisted',
  interview_scheduled: 'Interview Scheduled',
  hired: 'Hired',
  rejected: 'Rejected'
};

/**
 * The tabs above the table, and the six stat cards, share these keys. A tab counts every application
 * that reached that stage: `reviewed` includes the shortlisted, interview and hired ones, `shortlisted`
 * includes interview and hired, and so on. `rejected` stands apart. `all` is every application.
 * Pending Review is a status in the table only; it has no tab.
 */
export const APPLICATION_TABS = [
  'all',
  'reviewed',
  'shortlisted',
  'interview_scheduled',
  'hired',
  'rejected'
] as const;

export type ApplicationTab = (typeof APPLICATION_TABS)[number];

export const APPLICATION_TAB_LABELS: Record<ApplicationTab, string> = {
  all: 'All Applications',
  reviewed: 'Reviewed',
  shortlisted: 'Shortlisted',
  interview_scheduled: 'Interview Scheduled',
  hired: 'Hired',
  rejected: 'Rejected'
};

type ApplicationJobType = 'Full-time' | 'Part-time';

export interface HireAdminApplication {
  application_id: string;
  candidate_id: string;
  candidate_name: string;
  candidate_email: string;
  candidate_phone: string;
  /** City and state as shown under the name, for example `Hyderabad, TS`. */
  candidate_location: string;
  job_id: string;
  job_title: string;
  job_type: ApplicationJobType;
  recruiter_id: string;
  recruiter_name: string;
  outlet_name: string;
  /** City the job is in; the Location filter matches on this. */
  location: string;
  /** ISO timestamp with offset. Shown in India time (Asia/Kolkata). */
  applied_at: string;
  status: HireApplicationStatus;
  interview_at: string | null;
  resume_file_name: string | null;
}

export interface HireApplicationsSummary {
  /** Applications per tab key, see APPLICATION_TABS. Not changed by the table filters. */
  counts: Record<ApplicationTab, number>;
  /** Percent change against the previous period, per tab key. */
  growth_pct: Record<ApplicationTab, number>;
}

export type ApplicationOptionKind = 'jobs' | 'recruiters' | 'locations';

export interface ApplicationOption {
  value: string;
  label: string;
}

export interface ScheduleInterviewBody {
  /** ISO timestamp with offset. */
  interview_at: string;
}
