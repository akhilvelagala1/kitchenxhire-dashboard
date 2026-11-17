import { act, renderHook } from '@testing-library/react';
import type { RecruiterJobWithStats } from '../lib/recruiterPostedJobsStore';
import {
  RECRUITER_JOBS_PAGE_SIZE,
  useRecruiterJobsPostedSearch
} from './useRecruiterJobsPostedSearch';

function makeJob(id: string, title: string): RecruiterJobWithStats {
  return {
    id,
    title,
    category: undefined,
    openings: undefined,
    applicantCount: 0,
    postedAt: undefined,
    status: 'Active'
  };
}

// 12 jobs: enough for 3 pages of 5 ("Chef" appears in exactly 5 titles).
const twelveJobs: RecruiterJobWithStats[] = [
  makeJob('1', 'Head Chef'),
  makeJob('2', 'Sous Chef'),
  makeJob('3', 'Pastry Chef'),
  makeJob('4', 'Line Cook'),
  makeJob('5', 'Kitchen Porter'),
  makeJob('6', 'Restaurant Manager'),
  makeJob('7', 'Barista'),
  makeJob('8', 'Waiter'),
  makeJob('9', 'Sommelier'),
  makeJob('10', 'Dishwasher'),
  makeJob('11', 'Chef de Partie'),
  makeJob('12', 'Executive Chef')
];

// 15 jobs where "chef" matches exactly 8 titles, so the filtered set still
// spans 2 pages (ceil(8/5) = 2) -- this lets the page-2 -> search -> page-1
// reset be distinguished from mere clamping (which would leave page 2 valid).
const fifteenJobs: RecruiterJobWithStats[] = [
  makeJob('1', 'Head Chef'),
  makeJob('2', 'Sous Chef'),
  makeJob('3', 'Pastry Chef'),
  makeJob('4', 'Chef de Partie'),
  makeJob('5', 'Executive Chef'),
  makeJob('6', 'Grill Chef'),
  makeJob('7', 'Fish Chef'),
  makeJob('8', 'Chef Instructor'),
  makeJob('9', 'Line Cook'),
  makeJob('10', 'Kitchen Porter'),
  makeJob('11', 'Restaurant Manager'),
  makeJob('12', 'Barista'),
  makeJob('13', 'Waiter'),
  makeJob('14', 'Sommelier'),
  makeJob('15', 'Dishwasher')
];

describe('useRecruiterJobsPostedSearch', () => {
  it('shows the first page unfiltered by default', () => {
    const { result } = renderHook(() => useRecruiterJobsPostedSearch(twelveJobs));

    expect(result.current.search).toBe('');
    expect(result.current.pageResult).toMatchObject({
      page: 1,
      totalPages: 3,
      rangeStart: 1,
      rangeEnd: 5,
      total: 12
    });
    expect(result.current.pageResult.slice).toHaveLength(RECRUITER_JOBS_PAGE_SIZE);
    expect(result.current.pageResult.slice.map((job) => job.id)).toEqual(['1', '2', '3', '4', '5']);
  });

  it('filters by title case-insensitively on a partial match', () => {
    const { result } = renderHook(() => useRecruiterJobsPostedSearch(twelveJobs));

    act(() => result.current.setSearch('CHEF'));

    expect(result.current.pageResult.total).toBe(5);
    expect(
      result.current.pageResult.slice.every((job) => job.title.toLowerCase().includes('chef'))
    ).toBe(true);
    expect(result.current.pageResult.slice.map((job) => job.id).sort()).toEqual(
      ['1', '2', '3', '11', '12'].sort()
    );
  });

  it('resets to page 1 when the search text changes, even if the later page would still be valid', () => {
    const { result } = renderHook(() => useRecruiterJobsPostedSearch(fifteenJobs));

    act(() => result.current.setPage(2));
    expect(result.current.pageResult.page).toBe(2);

    act(() => result.current.setSearch('chef'));

    expect(result.current.pageResult).toMatchObject({
      page: 1,
      totalPages: 2,
      rangeStart: 1,
      rangeEnd: 5,
      total: 8
    });
  });

  it('computes rangeStart/rangeEnd/totalPages correctly across pages', () => {
    const { result } = renderHook(() => useRecruiterJobsPostedSearch(twelveJobs));

    act(() => result.current.setPage(2));
    expect(result.current.pageResult).toMatchObject({
      page: 2,
      totalPages: 3,
      rangeStart: 6,
      rangeEnd: 10,
      total: 12
    });
    expect(result.current.pageResult.slice).toHaveLength(5);

    act(() => result.current.setPage(3));
    expect(result.current.pageResult).toMatchObject({
      page: 3,
      totalPages: 3,
      rangeStart: 11,
      rangeEnd: 12,
      total: 12
    });
    expect(result.current.pageResult.slice).toHaveLength(2);
  });

  it('clamps an out-of-range stored page back to the last valid page', () => {
    const { result } = renderHook(() => useRecruiterJobsPostedSearch(twelveJobs));

    act(() => result.current.setPage(99));

    expect(result.current.pageResult.page).toBe(3);
    expect(result.current.pageResult.slice).toHaveLength(2);
  });

  it('returns an empty, single-page result for an empty jobs array', () => {
    const { result } = renderHook(() => useRecruiterJobsPostedSearch([]));

    expect(result.current.pageResult).toMatchObject({
      slice: [],
      page: 1,
      totalPages: 1,
      rangeStart: 0,
      rangeEnd: 0,
      total: 0
    });
  });
});
