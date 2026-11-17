import { useRef, type KeyboardEvent } from 'react';
import { useSearchParams } from 'react-router';
import { cn } from '@/shared/lib/cn';
import { REPORT_TABS, REPORT_TAB_LABELS, type ReportTab } from '../schemas/adminReports';
import { clearDrilldown } from './reportsDrilldownParams';
import { parseReportTab } from './reportsPageParams';

/** Every report now has a screen, so every pill is enabled (UI-14). */
const ENABLED_TABS: readonly ReportTab[] = REPORT_TABS;

const PILL =
  'inline-flex min-h-11 shrink-0 items-center justify-center rounded-full border px-5 text-sm whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 lg:h-[calc(37*var(--u))] lg:min-h-0 lg:px-[calc(24*var(--u))] lg:text-[calc(15*var(--u))]';

/**
 * The report pills under the title. Every pill is enabled now that every report has a screen; a
 * future report would land here as a disabled "Coming soon" button until its screen exists. Arrow
 * keys move between the enabled pills. A URL that names a report that does not exist shows Overview
 * selected. Choosing a pill, Overview included, closes an open stat card and forgets its search,
 * filter, page and sort, so Overview is the plain Overview again.
 */
export function ReportsTabs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const parsed = parseReportTab(searchParams);
  const selected = ENABLED_TABS.includes(parsed) ? parsed : 'overview';
  const pills = useRef<Partial<Record<ReportTab, HTMLButtonElement | null>>>({});

  function select(tab: ReportTab) {
    setSearchParams((prev) => {
      const next = clearDrilldown(prev);
      if (tab === 'overview') next.delete('report');
      else next.set('report', tab);
      return next;
    });
  }

  function moveOnArrow(event: KeyboardEvent<HTMLDivElement>) {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (step === 0) return;
    event.preventDefault();
    const next = ENABLED_TABS.at((ENABLED_TABS.indexOf(selected) + step) % ENABLED_TABS.length);
    if (!next) return;
    select(next);
    pills.current[next]?.focus();
  }

  return (
    <div
      role="tablist"
      aria-label="Report type"
      onKeyDown={moveOnArrow}
      className="-m-1 flex gap-2 overflow-x-auto p-1 lg:m-0 lg:gap-[calc(12*var(--u))] lg:overflow-visible lg:p-0"
    >
      {REPORT_TABS.map((tab) => {
        const enabled = ENABLED_TABS.includes(tab);
        const active = tab === selected;
        return (
          <button
            key={tab}
            ref={(element) => {
              pills.current[tab] = element;
            }}
            type="button"
            role="tab"
            aria-selected={active}
            aria-disabled={!enabled || undefined}
            disabled={!enabled}
            title={enabled ? undefined : 'Coming soon'}
            tabIndex={active ? 0 : -1}
            onClick={() => select(tab)}
            className={cn(
              PILL,
              active
                ? 'border-brand-600 bg-brand-600 font-semibold text-white'
                : 'border-[#E7E9F0] bg-white font-medium text-[#101828]',
              enabled && !active && 'hover:bg-[#F6F7FA]',
              !enabled && 'cursor-not-allowed'
            )}
          >
            {REPORT_TAB_LABELS[tab]}
          </button>
        );
      })}
    </div>
  );
}
