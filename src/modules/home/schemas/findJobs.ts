import type { EmploymentType, Job } from './home';

export type JobCategory =
  | 'cook'
  | 'kitchen-helper'
  | 'waiter'
  | 'bakery'
  | 'cleaning'
  | 'restaurant-manager'
  | 'kitchen-supervisor'
  | 'barista'
  | 'delivery'
  | 'cashier'
  | 'dishwasher'
  | 'store'
  | 'security';

export type ShiftKind = 'day' | 'evening' | 'night' | 'flexible' | 'rotational';

export type ExperienceBand = 'fresher' | '1-2' | '3-5' | '5-plus';

export type DatePostedWindow = '24h' | '3d' | '7d' | '30d';

export type SortOption = 'relevant' | 'latest' | 'oldest' | 'salary-high' | 'salary-low';

export interface FindJobListing extends Job {
  company: string;
  verified: boolean;
  category: JobCategory;
  shiftKind: ShiftKind;
  salaryMin: number;
  salaryMax: number;
  experience: ExperienceBand;
  /** ISO date used by Latest Jobs, Oldest Jobs, and Date Posted filter. */
  postedAt: string;
}

export interface FindJobsFilterState {
  role: string;
  city: string;
  categories: JobCategory[];
  types: EmploymentType[];
  shifts: ShiftKind[];
  experience: ExperienceBand[];
  salaryMin: number;
  salaryMax: number;
  datePosted: DatePostedWindow[];
  sort: SortOption;
  page: number;
}

export const SALARY_FLOOR = 8000;
export const SALARY_CEIL = 40000;
/** Desktop balance vs expanded Filter Jobs panel — content height, not empty stretch. */
export const FIND_JOBS_PAGE_SIZE = 10;
export const FIND_JOBS_CATEGORY_PREVIEW = 5;

export const JOB_CATEGORY_VALUES: JobCategory[] = [
  'cook',
  'kitchen-helper',
  'waiter',
  'bakery',
  'cleaning',
  'restaurant-manager',
  'kitchen-supervisor',
  'barista',
  'delivery',
  'cashier',
  'dishwasher',
  'store',
  'security'
];

export const SHIFT_VALUES: ShiftKind[] = ['day', 'evening', 'night', 'flexible', 'rotational'];

export const EXPERIENCE_VALUES: ExperienceBand[] = ['fresher', '1-2', '3-5', '5-plus'];

export const DATE_POSTED_VALUES: DatePostedWindow[] = ['24h', '3d', '7d', '30d'];

export const EMPLOYMENT_TYPE_VALUES: EmploymentType[] = [
  'Full-time',
  'Part-time',
  'Contract',
  'Temporary'
];
