import { CalendarDays, ChevronDown, Download } from 'lucide-react';
import { useSearchParams } from 'react-router';
import { ExportButton } from '@/shared/components/ExportButton';
import { PermissionGate } from '@/shared/components/PermissionGate';
import { Select } from '@/shared/ui/Input';
import { adminReportsApi } from '../api/adminReportsApi';
import { HIRE_ADMIN_PERMISSIONS as P } from '../permissions';
import { REPORT_RANGES, REPORT_RANGE_LABELS, type ReportRange } from '../schemas/adminReports';
import { resetDrilldownPage, useReportsDrilldown } from './reportsDrilldownParams';
import { parseReportTab, useReportRange } from './reportsPageParams';
import { rangeLabel } from './reportsRangeLabel';
import { useReportsOverview } from './useReportsOverview';

/** The window the page opens on. It is the default of the `range` URL parameter, so it is not kept there. */
const DEFAULT_RANGE: ReportRange = '30d';

const SHADOW = 'shadow-[0_1px_2px_rgba(16,24,40,0.05)]';
const SELECT = `appearance-none border-[#E7E9F0] bg-white pr-9 pl-10 font-medium text-[#101828] ${SHADOW} lg:h-[calc(40*var(--u))] lg:min-h-0 lg:rounded-[calc(11*var(--u))] lg:pr-[calc(38*var(--u))] lg:pl-[calc(46*var(--u))] lg:text-[calc(14*var(--u))]`;
const EXPORT = `min-h-11 rounded-xl border-[#E7E9F0]! pr-4! pl-10! font-semibold whitespace-nowrap text-[#101828]! ${SHADOW} lg:h-[calc(42*var(--u))] lg:min-h-0 lg:rounded-[calc(11*var(--u))] lg:pr-[calc(22*var(--u))]! lg:pl-[calc(57*var(--u))]! lg:text-[calc(15*var(--u))]`;

/** "Last 30 Days (26 May – 24 Jun 2026)", or just "Last 30 Days" until the first answer gives the dates. */
function optionText(range: ReportRange, to: string | undefined): string {
  const name = REPORT_RANGE_LABELS[range];
  return to ? `${name} (${rangeLabel(range, to)})` : name;
}

/**
 * The right end of the page heading: the date range menu, and Export of the same window (needs the
 * manage permission). Choosing a range sets the `range` URL parameter and keeps the others, except
 * the page of an open stat card, which starts again at 1. While a stat card is open, Export is of
 * that card's view (with what was typed or chosen in it), not of the Overview.
 */
export function ReportsHeaderActions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const range = useReportRange();
  const { metric, search, filter } = useReportsDrilldown();
  const { data } = useReportsOverview();
  const to = data?.range.to;
  /** A stat card is only open on Overview; on another pill a leftover `metric` is not one. */
  const openMetric = parseReportTab(searchParams) === 'overview' ? metric : null;

  function chooseRange(value: string) {
    const chosen = REPORT_RANGES.find((candidate) => candidate === value);
    if (!chosen) return;
    setSearchParams((prev) => {
      const next = resetDrilldownPage(prev);
      if (chosen === DEFAULT_RANGE) next.delete('range');
      else next.set('range', chosen);
      return next;
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2 lg:mt-[calc(5*var(--u))] lg:flex-nowrap lg:gap-[calc(22*var(--u))]">
      <div className="relative min-w-0 basis-full sm:min-w-[22rem] sm:basis-auto lg:w-[calc(368*var(--u))] lg:min-w-0 lg:flex-none">
        <CalendarDays
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-[#101828] lg:left-[calc(17*var(--u))] lg:size-[calc(20*var(--u))]"
        />
        <Select
          aria-label="Date range"
          value={range}
          onChange={(event) => chooseRange(event.target.value)}
          className={SELECT}
        >
          {REPORT_RANGES.map((value) => (
            <option key={value} value={value}>
              {optionText(value, to)}
            </option>
          ))}
        </Select>
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-[#101828] lg:right-[calc(15*var(--u))] lg:size-[calc(18*var(--u))]"
        />
      </div>
      <PermissionGate permission={P.manage}>
        <div className="relative flex-none">
          <Download
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3.5 z-10 size-4 -translate-y-1/2 text-[#101828] lg:left-[calc(22*var(--u))] lg:size-[calc(20*var(--u))]"
          />
          <ExportButton
            label="Export"
            start={() =>
              adminReportsApi.exportOverview(
                range,
                openMetric ? { metric: openMetric, search, filter } : undefined
              )
            }
            className={EXPORT}
          />
        </div>
      </PermissionGate>
    </div>
  );
}
