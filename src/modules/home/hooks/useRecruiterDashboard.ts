import { useCallback, useMemo, useState } from 'react';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import {
  computeRecruiterMetrics,
  defaultRecruiterQuery,
  filterRecruiterApplications,
  paginateRecruiterApplications,
  type RecruiterApplicationQuery,
  type RecruiterDateFilter,
  RECRUITER_APPLICATIONS_PAGE_SIZE
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
import type { RecruiterApplicationStatusFilter } from '../schemas/recruiterApplication';

export function useRecruiterDashboard() {
  const { session } = useRecruiterSession();
  const accountId = session ? normalizeRecruiterAccountId(session.phone) : '';

  const [applications, setApplications] = useState(() =>
    accountId ? readRecruiterApplications(accountId) : []
  );
  const [query, setQuery] = useState<RecruiterApplicationQuery>(() => defaultRecruiterQuery());
  const debouncedSearch = useDebouncedValue(query.search, 250);

  const jobs = useMemo(() => (accountId ? listRecruiterJobs(accountId) : []), [accountId]);

  const filtered = useMemo(
    () =>
      filterRecruiterApplications(applications, {
        search: debouncedSearch,
        jobId: query.jobId,
        status: query.status,
        dateRange: query.dateRange
      }),
    [applications, debouncedSearch, query.dateRange, query.jobId, query.status]
  );

  const pageResult = useMemo(
    () => paginateRecruiterApplications(filtered, query.page, RECRUITER_APPLICATIONS_PAGE_SIZE),
    [filtered, query.page]
  );

  const metrics = useMemo(
    () =>
      accountId
        ? computeRecruiterMetrics(applications, accountId)
        : {
            jobsPosted: 0,
            totalApplicants: 0,
            selectedHired: 0,
            rejected: 0,
            underReview: 0
          },
    [applications, accountId]
  );

  const setSearch = useCallback((search: string) => {
    setQuery((prev) => ({ ...prev, search, page: 1 }));
  }, []);

  const setJobId = useCallback((jobId: string) => {
    setQuery((prev) => ({ ...prev, jobId, page: 1 }));
  }, []);

  const setStatus = useCallback((status: RecruiterApplicationStatusFilter) => {
    setQuery((prev) => ({ ...prev, status, page: 1 }));
  }, []);

  const setDateRange = useCallback((dateRange: RecruiterDateFilter) => {
    setQuery((prev) => ({ ...prev, dateRange, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setQuery((prev) => ({ ...prev, page }));
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
      setApplications(readRecruiterApplications(accountId));
    },
    [accountId]
  );

  const applyStatusFilterFromMetric = useCallback((kind: 'all' | 'selected-hired' | 'rejected') => {
    if (kind === 'all') {
      setQuery((prev) => ({ ...prev, status: 'all', page: 1 }));
      return;
    }
    if (kind === 'rejected') {
      setQuery((prev) => ({ ...prev, status: 'rejected', page: 1 }));
      return;
    }
    setQuery((prev) => ({ ...prev, status: 'selected', page: 1 }));
  }, []);

  return {
    accountId,
    query,
    metrics,
    jobs,
    pageResult,
    filteredTotal: filtered.length,
    setSearch,
    setJobId,
    setStatus,
    setDateRange,
    setPage,
    accept,
    reject,
    updateNotes,
    applyStatusFilterFromMetric
  };
}
