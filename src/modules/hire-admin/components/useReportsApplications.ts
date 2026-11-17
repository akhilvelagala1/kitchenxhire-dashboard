import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { adminReportsApi } from '../api/adminReportsApi';
import { adminReportsKeys } from '../api/adminReportsKeys';
import { useReportRange } from './reportsPageParams';

/**
 * The Applications Report data for the range in the URL. Every card on the tab reads this same
 * request, so it is made once. The last range stays on screen while a new one loads.
 */
export function useReportsApplications() {
  const range = useReportRange();
  return useQuery({
    queryKey: adminReportsKeys.applicationsReport(range),
    queryFn: () => adminReportsApi.applicationsReport(range),
    placeholderData: keepPreviousData
  });
}
