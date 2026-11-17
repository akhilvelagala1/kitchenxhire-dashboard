import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { adminReportsApi } from '../api/adminReportsApi';
import { adminReportsKeys } from '../api/adminReportsKeys';
import { useReportRange } from './reportsPageParams';

/** How the average time to hire is made up, for the range in the URL. The last range stays up while a new one loads. */
export function useReportsTimeToHire() {
  const range = useReportRange();
  return useQuery({
    queryKey: adminReportsKeys.timeToHire(range),
    queryFn: () => adminReportsApi.timeToHire(range),
    placeholderData: keepPreviousData
  });
}

/** The choices of the category, outlet and rejection reason filters. They change rarely, so they are kept for five minutes. */
export function useReportsFilterOptions() {
  return useQuery({
    queryKey: adminReportsKeys.filterOptions(),
    queryFn: () => adminReportsApi.filterOptions(),
    staleTime: 5 * 60_000
  });
}
