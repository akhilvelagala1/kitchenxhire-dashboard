export const RECRUITER_STATUSES = ['active', 'inactive', 'pending', 'suspended'] as const;
export type RecruiterStatus = (typeof RECRUITER_STATUSES)[number];

export const RECRUITER_STATUS_LABELS: Record<RecruiterStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  pending: 'Pending',
  suspended: 'Suspended'
};

/** Statuses a person can be moved to by hand. `pending` ends when the account is activated. */
export type RecruiterSettableStatus = 'active' | 'inactive' | 'suspended';

/** Verification is independent of account status. */
export type RecruiterVerification = 'verified' | 'pending' | 'rejected';

export const RECRUITER_VERIFICATION_LABELS: Record<RecruiterVerification, string> = {
  verified: 'Verified',
  pending: 'Pending',
  rejected: 'Rejected'
};

/** One tab per status, plus All. A tab and the status filter narrow the same list. */
export const RECRUITER_TABS = ['all', ...RECRUITER_STATUSES] as const;
export type RecruiterTab = (typeof RECRUITER_TABS)[number];

export const RECRUITER_TAB_LABELS: Record<RecruiterTab, string> = {
  all: 'All Recruiters',
  ...RECRUITER_STATUS_LABELS
};

export const BUSINESS_TYPES = ['Restaurant', 'Cloud Kitchen', 'Food Court'] as const;
export type BusinessType = (typeof BUSINESS_TYPES)[number];

export interface HireAdminRecruiter {
  recruiter_id: string;
  business_name: string;
  business_type: BusinessType;
  /** Neighbourhood / outlet label, for example `Rajiv Nagar`. Shown as `Rajiv Nagar, Hyderabad`. */
  area: string;
  city: string;
  owner_name: string;
  phone: string;
  email: string;
  outlets: number;
  open_jobs: number;
  /** Applications attributed to this recruiter's postings. */
  applications: number;
  status: RecruiterStatus;
  verification: RecruiterVerification;
  /** ISO timestamp with offset. Shown in India time (Asia/Kolkata). */
  joined_at: string;
  /** ISO timestamp with offset; null when the recruiter has never signed in. */
  last_login_at: string | null;
}

/** What the add and edit forms send. */
export interface RecruiterInput {
  business_name: string;
  business_type: BusinessType;
  area: string;
  city: string;
  owner_name: string;
  phone: string;
  email: string;
}

export interface HireRecruitersSummary {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  suspended: number;
  /** The sum of `outlets` over all recruiters. */
  outlets: number;
  /** The sum of `open_jobs` over all recruiters. */
  open_jobs: number;
  hiring_actions: number;
  /** Percent change against the previous period. */
  growth_pct: Record<
    | 'total'
    | 'active'
    | 'inactive'
    | 'pending'
    | 'suspended'
    | 'outlets'
    | 'open_jobs'
    | 'hiring_actions',
    number
  >;
}
