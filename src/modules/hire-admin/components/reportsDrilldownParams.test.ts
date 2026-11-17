import { createElement, type ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { MemoryRouter, useLocation, useNavigationType } from 'react-router';
import { REPORT_KPI_KEYS, REPORTS_SORT_KEYS } from '../schemas/adminReportsDrilldown';
import {
  clearDrilldown,
  resetDrilldownPage,
  useReportsDrilldown,
  type ReportsDrilldown
} from './reportsDrilldownParams';

const wrap = (route: string) =>
  function Wrapper({ children }: { children: ReactNode }) {
    return createElement(MemoryRouter, { initialEntries: [route] }, children);
  };

/** The hook under test, with the URL and how it was reached beside it, to read both back. */
function useProbe() {
  return {
    drilldown: useReportsDrilldown(),
    location: useLocation(),
    navigation: useNavigationType()
  };
}

const mount = (query = '') => renderHook(useProbe, { wrapper: wrap(`/?${query}`) });
type Mounted = ReturnType<typeof mount>;

const read = (query: string): ReportsDrilldown => mount(query).result.current.drilldown;

/** The URL's parameters as a plain object, so a test does not depend on their order. */
const paramsOf = (view: Mounted) =>
  Object.fromEntries(new URLSearchParams(view.result.current.location.search));

type Setter = (drilldown: ReportsDrilldown) => void;

/** Runs one setter and returns the URL's parameters afterwards. */
function apply(view: Mounted, setter: Setter) {
  act(() => setter(view.result.current.drilldown));
  return paramsOf(view);
}

/** What belongs to the page, not to a card: the report, the window and anything else in the URL. */
const PAGE_PARAMS = { report: 'overview', range: '90d', utm: 'mail' };

/** A card open with a search, a filter, page 4 and a sort chosen in it, beside the page's own. */
const OPEN =
  'report=overview&range=90d&utm=mail&metric=jobs_posted&q=cook&filter=Hyderabad&page=4&sort=posted_at&order=asc';

const METRICS = Object.keys(REPORTS_SORT_KEYS) as (keyof typeof REPORTS_SORT_KEYS)[];
const NOT_A_CARD = ['bogus', 'JOBS_POSTED', 'jobs-posted', ''];

/** The setters for what is chosen inside a card. */
const CARD_SETTERS: [string, Setter][] = [
  ['searching', (d) => d.setSearch('chef')],
  ['filtering', (d) => d.setFilter('Hyderabad')],
  ['paging', (d) => d.setPage(3)],
  ['sorting', (d) => d.setSort('applications_count', 'asc')]
];

const ALL_SETTERS: [string, Setter][] = [
  ['opening a card', (d) => d.setMetric('hired')],
  ['closing the card', (d) => d.setMetric(null)],
  ...CARD_SETTERS
];

describe('useReportsDrilldown reading the URL', () => {
  it('shows the plain Overview when the URL names no card', () => {
    expect(read('range=30d')).toMatchObject({
      metric: null,
      search: '',
      filter: '',
      page: 1,
      sort: null,
      order: 'desc'
    });
  });

  it.each(REPORT_KPI_KEYS)('opens the %s card when the URL names it', (key) => {
    expect(read(`metric=${key}`).metric).toBe(key);
  });

  it.each(NOT_A_CARD)('shows no card for metric=%s', (value) => {
    expect(read(`metric=${value}`).metric).toBeNull();
  });

  it('reads the search from q and the filter from filter', () => {
    const { search, filter } = read('metric=hired&q=rahul&filter=Spice+Bowl');

    expect(search).toBe('rahul');
    expect(filter).toBe('Spice Bowl');
  });

  it('reads the page from the URL', () => {
    expect(read('metric=hired&page=7').page).toBe(7);
  });

  it.each(['0', '-3', 'abc', ''])('starts at page 1 for page=%s', (page) => {
    expect(read(`metric=hired&page=${page}`).page).toBe(1);
  });

  it.each(METRICS)('accepts every sort column of the %s list', (metric) => {
    for (const key of REPORTS_SORT_KEYS[metric]) {
      expect(read(`metric=${metric}&sort=${key}`).sort).toBe(key);
    }
  });

  it('ignores a sort column that belongs to another list', () => {
    expect(read('metric=hired&sort=posted_at').sort).toBeNull();
    expect(read('metric=jobs_posted&sort=hired_at').sort).toBeNull();
    expect(read('metric=rejected&sort=applied_at').sort).toBeNull();
  });

  it('ignores a sort column that no list has', () => {
    expect(read('metric=jobs_posted&sort=salary').sort).toBeNull();
  });

  it('has no sort while no card is open', () => {
    expect(read('sort=posted_at').sort).toBeNull();
  });

  it('never has a sort on the time to hire view, whatever column the URL names', () => {
    for (const key of Object.values(REPORTS_SORT_KEYS).flat()) {
      expect(read(`metric=avg_time_to_hire_days&sort=${key}`).sort).toBeNull();
    }
  });

  it('defaults the order to desc, which is newest first', () => {
    expect(read('metric=hired').order).toBe('desc');
  });

  it('reads asc from the URL and anything else as desc', () => {
    expect(read('order=asc').order).toBe('asc');
    expect(read('order=up').order).toBe('desc');
    expect(read('order=ASC').order).toBe('desc');
  });
});

describe('useReportsDrilldown opening and closing a card', () => {
  it('clears q, filter, page, sort and order and keeps range and report when a card opens', () => {
    const view = mount(OPEN);

    expect(apply(view, (d) => d.setMetric('hired'))).toEqual({ ...PAGE_PARAMS, metric: 'hired' });
  });

  it('removes metric and everything chosen inside it when closed with null', () => {
    const view = mount(OPEN);

    expect(apply(view, (d) => d.setMetric(null))).toEqual(PAGE_PARAMS);
  });

  it('shows the new card with nothing chosen in it', () => {
    const view = mount(OPEN);
    apply(view, (d) => d.setMetric('hired'));

    expect(view.result.current.drilldown).toMatchObject({
      metric: 'hired',
      search: '',
      filter: '',
      page: 1,
      sort: null,
      order: 'desc'
    });
  });

  it('adds a history step when a card opens, so Back closes it', () => {
    const view = mount('range=30d');
    apply(view, (d) => d.setMetric('hired'));

    expect(view.result.current.navigation).toBe('PUSH');
  });
});

describe('useReportsDrilldown search, filter, page and sort', () => {
  it('trims the search and starts again at page 1', () => {
    const view = mount('metric=jobs_posted&page=4&q=old');

    expect(apply(view, (d) => d.setSearch('  chef  '))).toEqual({
      metric: 'jobs_posted',
      q: 'chef'
    });
  });

  it('removes q when the search is empty or only spaces', () => {
    const view = mount('metric=hired&q=rahul');

    expect(apply(view, (d) => d.setSearch('   '))).toEqual({ metric: 'hired' });
  });

  it('starts again at page 1 when the filter changes', () => {
    const view = mount('metric=hired&page=3');

    expect(apply(view, (d) => d.setFilter('Spice Bowl'))).toEqual({
      metric: 'hired',
      filter: 'Spice Bowl'
    });
  });

  it('removes filter when the choice is cleared', () => {
    const view = mount('metric=hired&filter=Spice+Bowl');

    expect(apply(view, (d) => d.setFilter(''))).toEqual({ metric: 'hired' });
  });

  it('writes the page, and page 1 removes the parameter', () => {
    const view = mount('metric=hired');

    expect(apply(view, (d) => d.setPage(3))).toEqual({ metric: 'hired', page: '3' });
    expect(apply(view, (d) => d.setPage(1))).toEqual({ metric: 'hired' });
  });

  it('writes the sort with its order and starts again at page 1', () => {
    const view = mount('metric=jobs_posted&page=3');

    expect(apply(view, (d) => d.setSort('applications_count', 'asc'))).toEqual({
      metric: 'jobs_posted',
      sort: 'applications_count',
      order: 'asc'
    });
    expect(view.result.current.drilldown).toMatchObject({
      sort: 'applications_count',
      order: 'asc'
    });
  });

  it.each(CARD_SETTERS)('replaces the history entry when %s', (_what, set) => {
    const view = mount('metric=jobs_posted');
    apply(view, set);

    expect(view.result.current.navigation).toBe('REPLACE');
  });

  it.each(ALL_SETTERS)('keeps the parameters that are not its own when %s', (_what, set) => {
    const view = mount('report=overview&range=90d&utm=mail&metric=jobs_posted');

    expect(apply(view, set)).toMatchObject(PAGE_PARAMS);
  });
});

describe('clearDrilldown', () => {
  it('removes the card and everything chosen inside it and keeps the other parameters', () => {
    const next = clearDrilldown(new URLSearchParams(OPEN));

    expect(Object.fromEntries(next)).toEqual(PAGE_PARAMS);
  });

  it('changes nothing when no card is open', () => {
    const next = clearDrilldown(new URLSearchParams('report=overview&range=7d'));

    expect(Object.fromEntries(next)).toEqual({ report: 'overview', range: '7d' });
  });

  it('returns a new set and leaves the one it was given as it was', () => {
    const before = new URLSearchParams(OPEN);
    const next = clearDrilldown(before);

    expect(next).not.toBe(before);
    expect(before.toString()).toBe(new URLSearchParams(OPEN).toString());
  });
});

describe('resetDrilldownPage', () => {
  it('removes only the page and keeps the card and what was chosen in it', () => {
    const next = resetDrilldownPage(new URLSearchParams(OPEN));

    expect(Object.fromEntries(next)).toEqual({
      ...PAGE_PARAMS,
      metric: 'jobs_posted',
      q: 'cook',
      filter: 'Hyderabad',
      sort: 'posted_at',
      order: 'asc'
    });
  });

  it('changes nothing when the page is already 1', () => {
    const next = resetDrilldownPage(new URLSearchParams('metric=hired&q=rahul'));

    expect(Object.fromEntries(next)).toEqual({ metric: 'hired', q: 'rahul' });
  });

  it('returns a new set and leaves the one it was given as it was', () => {
    const before = new URLSearchParams(OPEN);
    const next = resetDrilldownPage(before);

    expect(next).not.toBe(before);
    expect(before.toString()).toBe(new URLSearchParams(OPEN).toString());
  });
});
