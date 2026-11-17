import { FIND_JOBS_DEMO_NOW_MS } from '../content/findJobsCatalog';
import type {
  DatePostedWindow,
  FindJobListing,
  FindJobsFilterState,
  SortOption
} from '../schemas/findJobs';
import { FIND_JOBS_PAGE_SIZE } from '../schemas/findJobs';
import { searchJobs } from './searchJobs';

function overlapsSalary(job: FindJobListing, min: number, max: number): boolean {
  return job.salaryMax >= min && job.salaryMin <= max;
}

const WINDOW_MS: Record<DatePostedWindow, number> = {
  '24h': 24 * 60 * 60 * 1000,
  '3d': 3 * 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000
};

export function matchesDatePosted(
  postedAt: string,
  windows: DatePostedWindow[],
  nowMs = FIND_JOBS_DEMO_NOW_MS
): boolean {
  if (windows.length === 0) return true;
  const postedMs = Date.parse(postedAt);
  if (!Number.isFinite(postedMs)) return false;
  return windows.some((window) => postedMs >= nowMs - WINDOW_MS[window]);
}

export function filterFindJobs(
  jobs: FindJobListing[],
  filters: FindJobsFilterState
): FindJobListing[] {
  let result = searchJobs(jobs, filters.role, filters.city) as FindJobListing[];

  if (filters.categories.length > 0) {
    result = result.filter((job) => filters.categories.includes(job.category));
  }
  if (filters.types.length > 0) {
    result = result.filter((job) => filters.types.includes(job.type));
  }
  if (filters.shifts.length > 0) {
    result = result.filter((job) => filters.shifts.includes(job.shiftKind));
  }
  if (filters.experience.length > 0) {
    result = result.filter((job) => filters.experience.includes(job.experience));
  }
  if (filters.datePosted.length > 0) {
    result = result.filter((job) => matchesDatePosted(job.postedAt, filters.datePosted));
  }

  return result.filter((job) => overlapsSalary(job, filters.salaryMin, filters.salaryMax));
}

export function sortFindJobs(jobs: FindJobListing[], sort: SortOption): FindJobListing[] {
  const copy = [...jobs];
  if (sort === 'latest') {
    copy.sort((a, b) => b.postedAt.localeCompare(a.postedAt));
  } else if (sort === 'oldest') {
    copy.sort((a, b) => a.postedAt.localeCompare(b.postedAt));
  } else if (sort === 'salary-high') {
    copy.sort((a, b) => b.salaryMax - a.salaryMax);
  } else if (sort === 'salary-low') {
    copy.sort((a, b) => a.salaryMin - b.salaryMin);
  }
  return copy;
}

export function paginateFindJobs<T>(items: T[], page: number, pageSize = FIND_JOBS_PAGE_SIZE): T[] {
  const safePage = Math.max(1, page);
  const start = (safePage - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function totalFindJobPages(total: number, pageSize = FIND_JOBS_PAGE_SIZE): number {
  return Math.max(1, Math.ceil(total / pageSize));
}
