import type {
  HireApplicationsReport,
  HireJobsReport,
  HireRecruitersReport,
  HireReportsOverview,
  HireUsersReport
} from '../schemas/adminReports';

/** The 30-day Overview as drawn in the reference picture. Used by the tests of every Reports card. */
export const REPORTS_OVERVIEW: HireReportsOverview = {
  range: { from: '2026-05-26', to: '2026-06-24' },
  kpis: {
    jobs_posted: { value: 1482, change_pct: 12 },
    applications: { value: 8672, change_pct: 18 },
    hired: { value: 590, change_pct: 15 },
    rejected: { value: 1036, change_pct: -5 },
    avg_time_to_hire_days: { value: 6.8, change_pct: -22 }
  },
  hiring_trend: [
    { date: '2026-05-26', applications: 469, jobs: 81, hires: 14 },
    { date: '2026-05-30', applications: 816, jobs: 142, hires: 42 },
    { date: '2026-06-03', applications: 1050, jobs: 150, hires: 74 },
    { date: '2026-06-07', applications: 891, jobs: 166, hires: 70 },
    { date: '2026-06-11', applications: 1125, jobs: 212, hires: 88 },
    { date: '2026-06-15', applications: 1238, jobs: 188, hires: 81 },
    { date: '2026-06-19', applications: 1241, jobs: 231, hires: 97 },
    { date: '2026-06-24', applications: 1842, jobs: 312, hires: 124 }
  ],
  application_status: [
    { status: 'hired', count: 590 },
    { status: 'shortlisted', count: 4960 },
    { status: 'under_review', count: 2086 },
    { status: 'rejected', count: 1036 }
  ],
  top_categories: [
    { label: 'Cook / Chef', count: 428 },
    { label: 'Kitchen Helper', count: 276 },
    { label: 'Cleaning & Stewarding', count: 198 },
    { label: 'Delivery & Store Support', count: 142 },
    { label: 'Bakery Assistant', count: 118 },
    { label: 'Others', count: 86 }
  ],
  top_locations: [
    { label: 'Hyderabad', count: 3248 },
    { label: 'Madhapur', count: 1286 },
    { label: 'Gachibowli', count: 982 },
    { label: 'Banjara Hills', count: 768 },
    { label: 'Kondapur', count: 646 }
  ],
  platform_growth: [
    { month: '2026-01', job_seekers: 9800, recruiters: 120 },
    { month: '2026-02', job_seekers: 12300, recruiters: 150 },
    { month: '2026-03', job_seekers: 15200, recruiters: 190 },
    { month: '2026-04', job_seekers: 17200, recruiters: 230 },
    { month: '2026-05', job_seekers: 20700, recruiters: 270 },
    { month: '2026-06', job_seekers: 24860, recruiters: 312 }
  ]
};

/** The 30-day Jobs Report. Its Total Jobs matches Overview's Jobs Posted, so the two tabs agree. */
export const JOBS_REPORT: HireJobsReport = {
  range: { from: '2026-05-26', to: '2026-06-24' },
  kpis: {
    total_jobs: { value: 1482, change_pct: 12 },
    active: { value: 1120, change_pct: 9 },
    closed: { value: 122, change_pct: -4 },
    draft: { value: 40, change_pct: 8 },
    avg_time_to_fill_days: { value: 6.8, change_pct: -22 }
  },
  jobs_trend: [
    { date: '2026-05-26', jobs_posted: 81 },
    { date: '2026-05-30', jobs_posted: 142 },
    { date: '2026-06-03', jobs_posted: 150 },
    { date: '2026-06-07', jobs_posted: 166 },
    { date: '2026-06-11', jobs_posted: 212 },
    { date: '2026-06-15', jobs_posted: 188 },
    { date: '2026-06-19', jobs_posted: 231 },
    { date: '2026-06-24', jobs_posted: 312 }
  ],
  jobs_status: [
    { status: 'active', count: 1120 },
    { status: 'under_review', count: 140 },
    { status: 'paused', count: 60 },
    { status: 'closed', count: 122 },
    { status: 'draft', count: 40 }
  ],
  top_categories: [
    { label: 'Cook / Chef', count: 428 },
    { label: 'Kitchen Helper', count: 276 },
    { label: 'Cleaning & Stewarding', count: 198 },
    { label: 'Delivery & Store Support', count: 142 },
    { label: 'Bakery Assistant', count: 118 },
    { label: 'Others', count: 86 }
  ],
  recent_jobs: [
    {
      id: 'JOB-2041',
      title: 'Cook / Chef',
      outlet: 'KitchenX - Banjara Hills',
      posted_on: '2026-06-24T10:24:00+05:30',
      applications: 42,
      status: 'active'
    },
    {
      id: 'JOB-2040',
      title: 'Kitchen Helper',
      outlet: 'KitchenX - Madhapur',
      posted_on: '2026-06-23T17:20:00+05:30',
      applications: 28,
      status: 'active'
    },
    {
      id: 'JOB-2039',
      title: 'Delivery & Store Support',
      outlet: 'KitchenX - Gachibowli',
      posted_on: '2026-06-23T11:10:00+05:30',
      applications: 16,
      status: 'closed'
    }
  ]
};

/** The 30-day Applications Report. Its Total Applications, status counts and locations match
 * Overview's own numbers exactly, so the two tabs agree. */
export const APPLICATIONS_REPORT: HireApplicationsReport = {
  range: { from: '2026-05-26', to: '2026-06-24' },
  kpis: {
    total_applications: { value: 8672, change_pct: 18 },
    shortlisted: { value: 4960, change_pct: 20 },
    under_review: { value: 2086, change_pct: 12 },
    hired: { value: 590, change_pct: 15 },
    rejected: { value: 1036, change_pct: -5 }
  },
  applications_trend: [
    { date: '2026-05-26', applications: 469 },
    { date: '2026-05-30', applications: 816 },
    { date: '2026-06-03', applications: 1050 },
    { date: '2026-06-07', applications: 891 },
    { date: '2026-06-11', applications: 1125 },
    { date: '2026-06-15', applications: 1238 },
    { date: '2026-06-19', applications: 1241 },
    { date: '2026-06-24', applications: 1842 }
  ],
  application_status: [
    { status: 'hired', count: 590 },
    { status: 'shortlisted', count: 4960 },
    { status: 'under_review', count: 2086 },
    { status: 'rejected', count: 1036 }
  ],
  top_categories: [
    { label: 'Cook / Chef', count: 2420 },
    { label: 'Kitchen Helper', count: 1580 },
    { label: 'Cleaning & Stewarding', count: 1166 },
    { label: 'Delivery & Store Support', count: 948 },
    { label: 'Bakery Assistant', count: 611 },
    { label: 'Others', count: 1948 }
  ],
  top_locations: [
    { label: 'Hyderabad', count: 3248 },
    { label: 'Madhapur', count: 1286 },
    { label: 'Gachibowli', count: 982 },
    { label: 'Banjara Hills', count: 768 },
    { label: 'Kondapur', count: 646 }
  ],
  recent_applications: [
    {
      id: 'APP-9421',
      candidate_name: 'Priya Sharma',
      job_title: 'Cook / Chef',
      applied_on: '2026-06-24T11:24:00+05:30',
      status: 'shortlisted'
    },
    {
      id: 'APP-9420',
      candidate_name: 'Rahul Menon',
      job_title: 'Kitchen Helper',
      applied_on: '2026-06-24T10:18:00+05:30',
      status: 'pending_review'
    },
    {
      id: 'APP-9419',
      candidate_name: 'Kiran Das',
      job_title: 'Delivery & Store Support',
      applied_on: '2026-06-23T18:40:00+05:30',
      status: 'rejected'
    }
  ]
};

/** The 30-day Users Report. Job Seekers (24,860) and Recruiters (312) match Overview's own Platform
 * Growth chart for June exactly, so the two tabs never disagree. */
export const USERS_REPORT: HireUsersReport = {
  range: { from: '2026-05-26', to: '2026-06-24' },
  kpis: {
    total_users: { value: 25830, change_pct: 19 },
    job_seekers: { value: 24860, change_pct: 20 },
    businesses: { value: 640, change_pct: 12 },
    recruiters: { value: 312, change_pct: 16 },
    new_users: { value: 1450, change_pct: 18 }
  },
  user_growth: [
    { month: '2026-01', users: 10770 },
    { month: '2026-02', users: 13270 },
    { month: '2026-03', users: 16170 },
    { month: '2026-04', users: 18170 },
    { month: '2026-05', users: 21670 },
    { month: '2026-06', users: 25830 }
  ],
  users_by_type: [
    { type: 'job_seeker', count: 24860 },
    { type: 'business', count: 640 },
    { type: 'recruiter', count: 312 },
    { type: 'admin', count: 18 }
  ],
  top_locations: [
    { label: 'Hyderabad', count: 9686 },
    { label: 'Madhapur', count: 3823 },
    { label: 'Gachibowli', count: 2919 },
    { label: 'Banjara Hills', count: 2299 },
    { label: 'Kondapur', count: 1911 }
  ],
  recent_users: [
    {
      id: 'USR-9421',
      name: 'Priya Sharma',
      user_type: 'job_seeker',
      registered_on: '2026-06-24T11:24:00+05:30',
      status: 'active'
    },
    {
      id: 'USR-9420',
      name: 'Rahul Menon',
      user_type: 'business',
      registered_on: '2026-06-24T10:18:00+05:30',
      status: 'active'
    },
    {
      id: 'USR-9419',
      name: 'Kiran Das',
      user_type: 'recruiter',
      registered_on: '2026-06-23T18:40:00+05:30',
      status: 'active'
    }
  ]
};

/** The 30-day Recruiter Report. Total Recruiters (312) matches Overview's own Platform Growth chart
 * and the Users Report tab's Recruiters KPI exactly, so no tab disagrees about how many exist. */
export const RECRUITERS_REPORT: HireRecruitersReport = {
  range: { from: '2026-05-26', to: '2026-06-24' },
  kpis: {
    total_recruiters: { value: 312, change_pct: 10 },
    active: { value: 248, change_pct: 12 },
    inactive: { value: 48, change_pct: -6 },
    new_recruiters: { value: 28, change_pct: 18 },
    avg_hires_per_recruiter: { value: 2.4, change_pct: 14 }
  },
  recruiter_activity: [
    { date: '2026-05-26', jobs_posted: 211, hires: 67 },
    { date: '2026-05-30', jobs_posted: 370, hires: 200 },
    { date: '2026-06-03', jobs_posted: 390, hires: 352 },
    { date: '2026-06-07', jobs_posted: 432, hires: 333 },
    { date: '2026-06-11', jobs_posted: 552, hires: 419 },
    { date: '2026-06-15', jobs_posted: 489, hires: 385 },
    { date: '2026-06-19', jobs_posted: 601, hires: 462 },
    { date: '2026-06-24', jobs_posted: 812, hires: 590 }
  ],
  recruiter_status: [
    { status: 'active', count: 248 },
    { status: 'inactive', count: 48 },
    { status: 'suspended', count: 10 },
    { status: 'pending', count: 6 }
  ],
  top_recruiters: [
    { label: 'Rajesh Kumar', count: 96 },
    { label: 'Anita Reddy', count: 78 },
    { label: 'Vikram Singh', count: 64 },
    { label: 'Priya Menon', count: 52 },
    { label: 'Arjun Das', count: 46 }
  ],
  recent_recruiters: [
    {
      id: 'REC-1048',
      name: 'Rahul Menon',
      outlet: 'KitchenX - Banjara Hills',
      joined_on: '2026-06-24T11:24:00+05:30',
      jobs_posted: 12,
      hires: 6,
      status: 'active'
    },
    {
      id: 'REC-1047',
      name: 'Sneha Reddy',
      outlet: 'KitchenX - Madhapur',
      joined_on: '2026-06-24T10:18:00+05:30',
      jobs_posted: 8,
      hires: 4,
      status: 'active'
    },
    {
      id: 'REC-1046',
      name: 'Kiran Das',
      outlet: 'KitchenX - Gachibowli',
      joined_on: '2026-06-23T18:40:00+05:30',
      jobs_posted: 6,
      hires: 2,
      status: 'inactive'
    }
  ]
};
