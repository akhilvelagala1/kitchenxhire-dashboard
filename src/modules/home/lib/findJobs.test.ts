import { FIND_JOBS_CATALOG } from '../content/findJobsCatalog';
import type { FindJobsFilterState } from '../schemas/findJobs';
import { SALARY_CEIL, SALARY_FLOOR } from '../schemas/findJobs';
import {
  filterFindJobs,
  matchesDatePosted,
  paginateFindJobs,
  sortFindJobs,
  totalFindJobPages
} from './findJobs';

const baseFilters: FindJobsFilterState = {
  role: '',
  city: '',
  categories: [],
  types: [],
  shifts: [],
  experience: [],
  salaryMin: SALARY_FLOOR,
  salaryMax: SALARY_CEIL,
  datePosted: [],
  sort: 'relevant',
  page: 1
};

describe('filterFindJobs', () => {
  it('returns the full catalog when city and facet filters are empty', () => {
    expect(filterFindJobs(FIND_JOBS_CATALOG, baseFilters).length).toBe(FIND_JOBS_CATALOG.length);
  });

  it('narrows results by category and employment type together', () => {
    const filtered = filterFindJobs(FIND_JOBS_CATALOG, {
      ...baseFilters,
      categories: ['cook'],
      types: ['Full-time']
    });
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((j) => j.category === 'cook' && j.type === 'Full-time')).toBe(true);
  });

  it('filters by experience and contract employment', () => {
    const filtered = filterFindJobs(FIND_JOBS_CATALOG, {
      ...baseFilters,
      experience: ['fresher'],
      types: ['Contract']
    });
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((j) => j.experience === 'fresher' && j.type === 'Contract')).toBe(true);
  });

  it('excludes jobs outside the salary window', () => {
    const filtered = filterFindJobs(FIND_JOBS_CATALOG, {
      ...baseFilters,
      salaryMin: 35000,
      salaryMax: 40000
    });
    expect(filtered.every((j) => j.salaryMax >= 35000)).toBe(true);
  });

  it('keeps only jobs inside a date-posted window', () => {
    const filtered = filterFindJobs(FIND_JOBS_CATALOG, {
      ...baseFilters,
      datePosted: ['24h']
    });
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((j) => matchesDatePosted(j.postedAt, ['24h']))).toBe(true);
    expect(filtered.length).toBeLessThan(FIND_JOBS_CATALOG.length);
  });

  it('limits results to the selected city', () => {
    const filtered = filterFindJobs(FIND_JOBS_CATALOG, {
      ...baseFilters,
      city: 'Hyderabad'
    });
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.length).toBeLessThan(FIND_JOBS_CATALOG.length);
    expect(filtered.every((j) => j.searchText.includes('hyderabad'))).toBe(true);
  });
});

describe('sortFindJobs', () => {
  it('orders by highest salary when requested', () => {
    const sorted = sortFindJobs(FIND_JOBS_CATALOG.slice(0, 20), 'salary-high');
    expect(sorted[0]!.salaryMax).toBeGreaterThanOrEqual(sorted.at(-1)!.salaryMax);
  });

  it('puts the newest posting first for latest and the oldest first for oldest', () => {
    const latest = sortFindJobs(FIND_JOBS_CATALOG, 'latest');
    const oldest = sortFindJobs(FIND_JOBS_CATALOG, 'oldest');
    expect(latest[0]!.id).toBe('find-job-1');
    expect(latest.at(-1)!.id).toBe('find-job-126');
    expect(oldest[0]!.id).toBe('find-job-126');
    expect(oldest.at(-1)!.id).toBe('find-job-1');
  });
});

describe('paginateFindJobs', () => {
  it('returns ten items on the first page and thirteen pages for 126 jobs', () => {
    expect(paginateFindJobs(FIND_JOBS_CATALOG, 1)).toHaveLength(10);
    expect(totalFindJobPages(FIND_JOBS_CATALOG.length)).toBe(13);
  });
});
