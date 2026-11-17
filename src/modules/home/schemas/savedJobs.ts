import type { ApplicationStatus } from './jobApplication';
import type { JobCategory } from './findJobs';

export interface SavedJobEntry {
  id: string;
  savedAt: string;
}

export type SavedJobsSort =
  'recently-saved' | 'oldest-saved' | 'title-az' | 'salary-low' | 'salary-high';

export interface SavedJobsFilterState {
  query: string;
  location: string;
  category: JobCategory | '';
  sort: SavedJobsSort;
  page: number;
}

export const SAVED_JOBS_PAGE_SIZE = 4;

export const SAVED_JOBS_SORT_OPTIONS: { id: SavedJobsSort; label: string }[] = [
  { id: 'recently-saved', label: 'Recently Saved' },
  { id: 'oldest-saved', label: 'Oldest Saved' },
  { id: 'title-az', label: 'Job Title A–Z' },
  { id: 'salary-low', label: 'Salary Low to High' },
  { id: 'salary-high', label: 'Salary High to Low' }
];

/** My Applications pills: status filters + Saved Jobs tab. */
export type MyApplicationsTab = 'all' | ApplicationStatus | 'saved';
