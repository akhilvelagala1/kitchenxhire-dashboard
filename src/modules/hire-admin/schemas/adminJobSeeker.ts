export const JOB_SEEKER_STATUSES = ['active', 'inactive', 'under_review', 'suspended'] as const;
export type JobSeekerStatus = (typeof JOB_SEEKER_STATUSES)[number];

export const JOB_SEEKER_STATUS_LABELS: Record<JobSeekerStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  under_review: 'Under Review',
  suspended: 'Suspended'
};

/** Tabs above the table. Inactive includes every non-active account (Under Review and Suspended). */
export const JOB_SEEKER_TABS = ['all', 'active', 'inactive'] as const;
export type JobSeekerTab = (typeof JOB_SEEKER_TABS)[number];

export const JOB_SEEKER_TAB_LABELS: Record<JobSeekerTab, string> = {
  all: 'All Job Seekers',
  active: 'Active',
  inactive: 'Inactive'
};

/** Whole years of experience, in the bands of the "All Experience" filter. */
export const EXPERIENCE_BANDS = [
  { value: '0-1', label: '0–1 Years' },
  { value: '2-3', label: '2–3 Years' },
  { value: '4-5', label: '4–5 Years' },
  { value: '6+', label: '6+ Years' }
] as const;
export type ExperienceBand = (typeof EXPERIENCE_BANDS)[number]['value'];

export interface HireAdminJobSeeker {
  job_seeker_id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  /** Two-letter region code shown after the city, for example `TS`. */
  state: string;
  /** The role the person is looking for, for example `Cook / Chef`. */
  preferred_job_title: string;
  experience_years: number;
  /** Profile completeness 0–100. */
  profile_completion: number;
  applications_count: number;
  interviews_count: number;
  /** Applications that reached Shortlisted or beyond; at most `applications_count`. */
  shortlisted_count: number;
  /** Applications that ended in a hire; at most `shortlisted_count`. */
  hired_count: number;
  status: JobSeekerStatus;
  /** ISO timestamp with offset. Shown in India time (Asia/Kolkata). */
  joined_at: string;
  /** ISO timestamp with offset; null when the person has never been active. */
  last_active_at: string | null;
}

/** What the add and edit forms send. */
export interface JobSeekerInput {
  name: string;
  email: string;
  phone: string;
  city: string;
  preferred_job_title: string;
  experience_years: number;
}

export interface HireJobSeekersSummary {
  total: number;
  active: number;
  /** Every non-active account (Inactive + Under Review + Suspended). */
  inactive: number;
  /** The sum of `applications_count` over all job seekers. */
  total_applications: number;
  /** Job seekers with `shortlisted_count` above 0. */
  shortlisted: number;
  /** Job seekers with `hired_count` above 0. */
  hired: number;
  growth_pct: Record<
    'total' | 'active' | 'inactive' | 'total_applications' | 'shortlisted' | 'hired',
    number
  >;
}
