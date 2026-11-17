export interface HireDashboardSummary {
  total_jobs: number;
  total_applications: number;
  active_recruiters: number;
  job_seekers: number;
  growth_jobs_pct: number;
  growth_applications_pct: number;
  growth_recruiters_pct: number;
  growth_job_seekers_pct: number;
}

export interface TrendPoint {
  date: string;
  count: number;
}

export type ApplicationStatus =
  'NEW' | 'UNDER_REVIEW' | 'SHORTLISTED' | 'INTERVIEW' | 'HIRED' | 'REJECTED';

export interface RecentApplicationRow {
  id: string;
  candidate_name: string;
  candidate_initials: string;
  job_title: string;
  location: string;
  status: ApplicationStatus;
  applied_at: string;
}

export interface OpenJobCategoryRow {
  id: string;
  label: string;
  count: number;
}

export type TrendRange = '7d' | '30d' | '90d';
