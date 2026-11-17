import { useCallback, useMemo, useState } from 'react';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import {
  defaultRecruiterMyApplicationsQuery,
  filterRecruiterApplications,
  listRecruiterApplicationLocations,
  paginateRecruiterApplications,
  type RecruiterApplicationQuery,
  type RecruiterDateFilter
} from '../lib/recruiterDashboard';
import {
  acceptRecruiterApplication,
  readRecruiterApplications,
  rejectRecruiterApplication,
  updateRecruiterApplicationNotes
} from '../lib/recruiterApplicationsStore';
import { normalizeRecruiterAccountId } from '../lib/recruiterAccount';
import { listRecruiterJobs } from '../lib/recruiterPostedJobsStore';
import { useRecruiterSession } from '../lib/recruiterSession';
import {
  RECRUITER_MY_APPLICATIONS_PAGE_SIZE,
  type RecruiterMyApplicationsTab
} from '../schemas/recruiterApplication';

export function useRecruiterMyApplicationsDashboard() {
  const { session } = useRecruiterSession();
  const accountId = session ? normalizeRecruiterAccountId(session.phone) : '';

  const [applications, setApplications] = useState(() =>
    accountId ? readRecruiterApplications(accountId) : []
  );
  const [query, setQuery] = useState<RecruiterApplicationQuery>(() =>
    defaultRecruiterMyApplicationsQuery()
  );
  const debouncedSearch = useDebouncedValue(query.search, 350);

  const jobs = useMemo(() => (accountId ? listRecruiterJobs(accountId) : []), [accountId]);

  const filtered = useMemo(
    () =>
      filterRecruiterApplications(applications, {
        search: debouncedSearch,
        jobId: query.jobId,
        status: 'all',
        dateRange: query.dateRange,
        location: query.location,
        tab: query.tab
      }),
    [applications, debouncedSearch, query.dateRange, query.jobId, query.location, query.tab]
  );

  const pageResult = useMemo(
    () => paginateRecruiterApplications(filtered, query.page, RECRUITER_MY_APPLICATIONS_PAGE_SIZE),
    [filtered, query.page]
  );

  const locations = useMemo(() => listRecruiterApplicationLocations(applications), [applications]);

  const setSearch = useCallback((search: string) => {
    setQuery((prev) => ({ ...prev, search, page: 1 }));
  }, []);

  const setJobId = useCallback((jobId: string) => {
    setQuery((prev) => ({ ...prev, jobId, page: 1 }));
  }, []);

  const setLocation = useCallback((location: string) => {
    setQuery((prev) => ({ ...prev, location, page: 1 }));
  }, []);

  const setTab = useCallback((tab: RecruiterMyApplicationsTab) => {
    setQuery((prev) => ({ ...prev, tab, page: 1 }));
  }, []);

  const setDateRange = useCallback((dateRange: RecruiterDateFilter) => {
    setQuery((prev) => ({ ...prev, dateRange, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setQuery((prev) => ({ ...prev, page }));
  }, []);

  const clearFilters = useCallback(() => {
    setQuery(defaultRecruiterMyApplicationsQuery());
  }, []);

  const accept = useCallback(
    (id: string) => {
      if (!accountId) return;
      setApplications(acceptRecruiterApplication(accountId, id));
    },
    [accountId]
  );

  const reject = useCallback(
    (id: string) => {
      if (!accountId) return;
      setApplications(rejectRecruiterApplication(accountId, id));
    },
    [accountId]
  );

  const updateNotes = useCallback(
    (applicationId: string, notes: string) => {
      if (!accountId) return;
      updateRecruiterApplicationNotes(accountId, applicationId, notes);
      setApplications((prev) =>
        prev.map((application) =>
          application.id === applicationId ? { ...application, recruiterNotes: notes } : application
        )
      );
    },
    [accountId]
  );

  const filtersActive =
    Boolean(query.search.trim()) ||
    query.jobId !== 'all' ||
    query.location !== 'all' ||
    query.dateRange !== '30d';

  return {
    applications,
    accountId,
    query,
    jobs,
    locations,
    pageResult,
    filtersActive,
    setSearch,
    setJobId,
    setLocation,
    setTab,
    setDateRange,
    setPage,
    clearFilters,
    accept,
    reject,
    updateNotes
  };
}
