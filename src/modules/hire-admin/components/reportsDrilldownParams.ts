import { useSearchParams } from 'react-router';
import type { SortDirection } from '@/shared/api/types';
import type { ReportKpiKey } from '../schemas/adminReports';
import { REPORT_KPI_KEYS, REPORTS_SORT_KEYS } from '../schemas/adminReportsDrilldown';

/** The URL parameters that belong to the open stat card, besides `metric` itself. */
const DETAIL_KEYS = ['q', 'filter', 'page', 'sort', 'order'] as const;

/** The `metric` URL parameter: which stat card is open. Anything else is none, the plain Overview. */
function parseMetric(params: URLSearchParams): ReportKpiKey | null {
  const value = params.get('metric');
  return REPORT_KPI_KEYS.find((key) => key === value) ?? null;
}

function parsePage(params: URLSearchParams): number {
  const page = Number.parseInt(params.get('page') ?? '', 10);
  return Number.isInteger(page) && page >= 1 ? page : 1;
}

/** Only a column the open list can really be sorted by counts; anything else is the default order. */
function parseSort(params: URLSearchParams, metric: ReportKpiKey | null): string | null {
  if (!metric || metric === 'avg_time_to_hire_days') return null;
  const keys: readonly string[] = REPORTS_SORT_KEYS[metric];
  return keys.find((key) => key === params.get('sort')) ?? null;
}

function dropDetail(params: URLSearchParams) {
  DETAIL_KEYS.forEach((key) => params.delete(key));
}

/** The same parameters with page 1 again, for when the window changes under an open card. */
export function resetDrilldownPage(params: URLSearchParams): URLSearchParams {
  const next = new URLSearchParams(params);
  next.delete('page');
  return next;
}

/** The same parameters with no card open: forgets the card and everything chosen inside it. */
export function clearDrilldown(params: URLSearchParams): URLSearchParams {
  const next = new URLSearchParams(params);
  next.delete('metric');
  dropDetail(next);
  return next;
}

export interface ReportsDrilldown {
  /** The open stat card, or null for the plain Overview. */
  metric: ReportKpiKey | null;
  /** Empty for no search. */
  search: string;
  /** Empty for all. */
  filter: string;
  /** 1-based. */
  page: number;
  /** A sortable column of the open list, or null for newest first. */
  sort: string | null;
  order: SortDirection;
  /** Opens a card, or closes it with null. Forgets the search, filter, page and sort of the one before. */
  setMetric: (metric: ReportKpiKey | null) => void;
  /** Starts again at page 1. */
  setSearch: (value: string) => void;
  /** Starts again at page 1. */
  setFilter: (value: string) => void;
  setPage: (page: number) => void;
  /** Starts again at page 1. */
  setSort: (key: string, order: SortDirection) => void;
}

/**
 * The state of the open stat card, kept in the URL next to `report` and `range` so a refresh or a
 * shared link lands on the same list. Every setter keeps the parameters that are not its own.
 */
export function useReportsDrilldown(): ReportsDrilldown {
  const [searchParams, setSearchParams] = useSearchParams();
  const metric = parseMetric(searchParams);

  /** Opening a card is a step in the history; typing, filtering and paging only replace the entry. */
  function update(change: (next: URLSearchParams) => void, replace = true) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        change(next);
        return next;
      },
      { replace }
    );
  }

  function put(next: URLSearchParams, key: string, value: string) {
    if (value) next.set(key, value);
    else next.delete(key);
  }

  return {
    metric,
    search: searchParams.get('q') ?? '',
    filter: searchParams.get('filter') ?? '',
    page: parsePage(searchParams),
    sort: parseSort(searchParams, metric),
    order: searchParams.get('order') === 'asc' ? 'asc' : 'desc',
    setMetric: (value) =>
      update((next) => {
        dropDetail(next);
        put(next, 'metric', value ?? '');
      }, false),
    setSearch: (value) =>
      update((next) => {
        put(next, 'q', value.trim());
        next.delete('page');
      }),
    setFilter: (value) =>
      update((next) => {
        put(next, 'filter', value);
        next.delete('page');
      }),
    setPage: (page) => update((next) => put(next, 'page', page > 1 ? String(page) : '')),
    setSort: (key, order) =>
      update((next) => {
        next.set('sort', key);
        next.set('order', order);
        next.delete('page');
      })
  };
}
