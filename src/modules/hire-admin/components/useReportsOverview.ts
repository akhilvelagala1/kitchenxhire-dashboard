import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { adminReportsApi } from '../api/adminReportsApi';
import { adminReportsKeys } from '../api/adminReportsKeys';
import { useReportRange } from './reportsPageParams';

/**
 * The Overview data for the range in the URL. Every card on the page reads this same request, so
 * it is made once. The last range stays on screen while a new one loads.
 */
export function useReportsOverview() {
  const range = useReportRange();
  return useQuery({
    queryKey: adminReportsKeys.overview(range),
    queryFn: () => adminReportsApi.overview(range),
    placeholderData: keepPreviousData
  });
}
