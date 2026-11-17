import type { EmploymentType, Job } from './home';
import type { FindJobListing, JobCategory } from './findJobs';

export type ApplicationStatus =
  'under-review' | 'shortlisted' | 'interview' | 'selected' | 'closed';

export type ApplicationStatusFilter = 'all' | ApplicationStatus;

export interface JobApplication {
  id: string;
  jobId: string;
  title: string;
  company: string;
  area: string;
  shift: string;
  pay: string;
  type: EmploymentType;
  category: JobCategory;
  appliedAt: string;
  status: ApplicationStatus;
}

export const APPLICATION_STATUS_LABEL: Record<ApplicationStatus, string> = {
  'under-review': 'Under Review',
  shortlisted: 'Shortlisted',
  interview: 'Interview Scheduled',
  selected: 'Selected',
  closed: 'Closed'
};

/** Six cards + compact footer fit a typical desktop viewport without scrolling for pagination. */
export const APPLICATIONS_PAGE_SIZE = 6;

export function applicationFromListing(
  job: FindJobListing,
  appliedAt = new Date()
): JobApplication {
  return {
    id: `app-${job.id}-${appliedAt.getTime()}`,
    jobId: job.id,
    title: job.title,
    company: job.company,
    area: job.area,
    shift: job.shift,
    pay: job.pay,
    type: job.type,
    category: job.category,
    appliedAt: appliedAt.toISOString(),
    status: 'under-review'
  };
}

export function isFindJobListing(job: Job): job is FindJobListing {
  return 'category' in job && 'company' in job;
}
