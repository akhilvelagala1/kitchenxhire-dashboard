export type HireJobStatus = 'active' | 'under_review' | 'paused' | 'closed' | 'draft';

export interface HireAdminJob {
  job_id: string;
  title: string;
  recruiter_id: string;
  recruiter_name: string;
  business_name: string;
  category: 'Kitchen' | 'Operations' | 'Logistics' | 'Management';
  job_category_label: string;
  location: string;
  applications_count: number;
  recruited_count: number;
  status: HireJobStatus;
  posted_at: string;
}

export interface HireJobsSummary {
  total_jobs: number;
  total_applications: number;
  total_recruiters: number;
  total_recruited: number;
  closed_jobs: number;
  active_jobs: number;
  under_review_jobs: number;
  paused_jobs: number;
  draft_jobs: number;
  growth_jobs_pct: number;
  growth_applications_pct: number;
  growth_recruiters_pct: number;
  growth_recruited_pct: number;
  growth_closed_pct: number;
}

export type JobsDateRangePreset = '1d' | 'yesterday' | '7d' | '30d' | '90d' | 'custom';
