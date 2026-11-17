import type {
  ApplicationStatus,
  ApplicationStatusFilter,
  JobApplication
} from '../schemas/jobApplication';
import { APPLICATIONS_PAGE_SIZE } from '../schemas/jobApplication';

export function countApplicationsByStatus(applications: JobApplication[]) {
  const counts: Record<ApplicationStatus, number> = {
    'under-review': 0,
    shortlisted: 0,
    interview: 0,
    selected: 0,
    closed: 0
  };
  for (const app of applications) counts[app.status] += 1;
  return counts;
}

export function filterApplicationsByStatus(
  applications: JobApplication[],
  filter: ApplicationStatusFilter
): JobApplication[] {
  if (filter === 'all') return applications;
  return applications.filter((app) => app.status === filter);
}

export function sortApplicationsNewestFirst(applications: JobApplication[]): JobApplication[] {
  return [...applications].sort(
    (a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
  );
}

export function paginateApplications<T>(
  items: T[],
  page: number,
  pageSize = APPLICATIONS_PAGE_SIZE
): T[] {
  const safePage = Math.max(1, page);
  const start = (safePage - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function totalApplicationPages(total: number, pageSize = APPLICATIONS_PAGE_SIZE): number {
  return Math.max(1, Math.ceil(total / pageSize));
}

export function formatAppliedDate(iso: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date(iso));
}
