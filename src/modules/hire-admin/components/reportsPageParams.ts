import { useSearchParams } from 'react-router';
import {
  REPORT_RANGES,
  REPORT_TABS,
  type ReportRange,
  type ReportTab
} from '../schemas/adminReports';

/** The `range` URL parameter: 7d, 30d or 90d. Anything else is the default, 30d. */
function parseReportRange(searchParams: URLSearchParams): ReportRange {
  const value = searchParams.get('range');
  return REPORT_RANGES.find((range) => range === value) ?? '30d';
}

/** The `report` URL parameter: which pill is selected. Anything else is Overview. */
export function parseReportTab(searchParams: URLSearchParams): ReportTab {
  const value = searchParams.get('report');
  return REPORT_TABS.find((tab) => tab === value) ?? 'overview';
}

export function useReportRange(): ReportRange {
  const [searchParams] = useSearchParams();
  return parseReportRange(searchParams);
}
