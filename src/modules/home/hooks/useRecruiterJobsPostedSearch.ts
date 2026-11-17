import { useCallback, useMemo, useState } from 'react';
import type { RecruiterJobWithStats } from '../lib/recruiterPostedJobsStore';

export const RECRUITER_JOBS_PAGE_SIZE = 5;

interface RecruiterJobsPostedPageResult {
  slice: RecruiterJobWithStats[];
  page: number;
  totalPages: number;
  rangeStart: number;
  rangeEnd: number;
  total: number;
}

export interface RecruiterJobsPostedSearchResult {
  search: string;
  setSearch: (value: string) => void;
  pageResult: RecruiterJobsPostedPageResult;
  setPage: (page: number) => void;
}

/**
 * Search + pagination for the recruiter's "Jobs Posted" table. The
 * `pageResult` shape mirrors `paginateRecruiterApplications` (see
 * `recruiterDashboard.ts`), used by the sibling applications dashboard
 * (`useRecruiterMyApplicationsDashboard`), so both tables page the same way.
 */
export function useRecruiterJobsPostedSearch(
  jobs: RecruiterJobWithStats[]
): RecruiterJobsPostedSearchResult {
  const [search, setSearchState] = useState('');
  const [page, setPageState] = useState(1);

  // Track the search text from the previous render and reset to page 1 when
  // it changes, comparing in the render body instead of a useEffect +
  // setState (react-hooks/set-state-in-effect forbids calling setState
  // synchronously inside a useEffect) -- same pattern as
  // RecruiterAccountSettingsPersonalPanel's `trackedProfile` comparison.
  const [trackedSearch, setTrackedSearch] = useState(search);
  if (search !== trackedSearch) {
    setTrackedSearch(search);
    setPageState(1);
  }

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return jobs;
    return jobs.filter((job) => job.title.toLowerCase().includes(term));
  }, [jobs, search]);

  const pageResult = useMemo<RecruiterJobsPostedPageResult>(() => {
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / RECRUITER_JOBS_PAGE_SIZE));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const start = (safePage - 1) * RECRUITER_JOBS_PAGE_SIZE;
    return {
      slice: filtered.slice(start, start + RECRUITER_JOBS_PAGE_SIZE),
      page: safePage,
      totalPages,
      rangeStart: total === 0 ? 0 : start + 1,
      rangeEnd: Math.min(start + RECRUITER_JOBS_PAGE_SIZE, total),
      total
    };
  }, [filtered, page]);

  const setSearch = useCallback((value: string) => {
    setSearchState(value);
  }, []);

  const setPage = useCallback((value: number) => {
    setPageState(value);
  }, []);

  return {
    search,
    setSearch,
    pageResult,
    setPage
  };
}
