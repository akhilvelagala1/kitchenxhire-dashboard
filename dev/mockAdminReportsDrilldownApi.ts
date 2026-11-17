import type { ServerResponse } from 'node:http';
import { invalid, ok } from './categoriesHttp.ts';
import { invalidReportsRange } from './mockAdminReportsApi.ts';
import {
  APPLICATIONS_LIST,
  HIRED_LIST,
  JOBS_LIST,
  REJECTED_LIST,
  queryRecords,
  reportsFilterOptions,
  type ListSpec
} from './reportsDrilldownQuery.ts';
import { parseReportsRange, type ReportRange } from './reportsMockData.ts';
import { reportsTimeToHire } from './reportsTimeToHireMockData.ts';

const BASE = '/hire/admin/reports/overview';
const FILTER_OPTIONS = `${BASE}/filter-options`;
const PAGE_SIZES: readonly number[] = [5, 10, 20, 50];
const DEFAULT_PAGE_SIZE = 5;

/** A whole number written in digits, the fallback when there is none, and NaN for anything else. */
const wholeNumber = (raw: string | null, fallback: number) =>
  raw === null ? fallback : /^\d+$/.test(raw) ? Number(raw) : Number.NaN;

/**
 * Answers one stat-card list: ?range, page (from 1, default 1), page_size (5, 10, 20 or 50, default 5),
 * search, the list's own filter parameter, sort (one of the list's sortable columns) and order (asc or
 * desc). A parameter that is not allowed is a 422 VALIDATION_ERROR with error.fields keyed by it. Nothing
 * else is an error: a category, outlet or reason nobody has matches no rows, a page past the last has
 * none either (with the real total), and an order with no sort means nothing.
 */
function answerList<Row>(res: ServerResponse, url: URL, range: ReportRange, spec: ListSpec<Row>) {
  const params = url.searchParams;
  const fields: Record<string, string> = {};

  const page = wholeNumber(params.get('page'), 1);
  if (!(page >= 1)) fields.page = 'Page must be a whole number from 1.';

  const pageSize = wholeNumber(params.get('page_size'), DEFAULT_PAGE_SIZE);
  if (!PAGE_SIZES.includes(pageSize)) {
    fields.page_size = `Page size must be one of: ${PAGE_SIZES.join(', ')}.`;
  }

  const sort = params.get('sort');
  if (sort !== null && !Object.hasOwn(spec.sorts, sort)) {
    fields.sort = `Sort must be one of: ${Object.keys(spec.sorts).join(', ')}.`;
  }

  const order = params.get('order');
  if (order !== null && order !== 'asc' && order !== 'desc') {
    fields.order = 'Order must be asc or desc.';
  }

  const filter = params.get(spec.filterParam) ?? '';
  const problem = filter ? spec.filterProblem?.(filter) : undefined;
  if (problem) fields[spec.filterParam] = problem;

  if (Object.keys(fields).length > 0) {
    invalid(res, 'Check the highlighted fields.', fields);
    return;
  }
  const { rows, total } = queryRecords(spec, {
    range,
    page,
    pageSize,
    search: params.get('search') ?? '',
    filter,
    sort: sort ?? undefined,
    order: order === 'asc' ? 'asc' : 'desc'
  });
  ok(res, rows, { page, page_size: pageSize, total });
}

type Route = (res: ServerResponse, url: URL, range: ReportRange) => void;

/** The routes that read ?range. filter-options reads nothing, so it is answered before the range is looked at. */
const ROUTES = new Map<string, Route>([
  [`${BASE}/jobs`, (res, url, range) => answerList(res, url, range, JOBS_LIST)],
  [`${BASE}/applications`, (res, url, range) => answerList(res, url, range, APPLICATIONS_LIST)],
  [`${BASE}/hired`, (res, url, range) => answerList(res, url, range, HIRED_LIST)],
  [`${BASE}/rejected`, (res, url, range) => answerList(res, url, range, REJECTED_LIST)],
  [`${BASE}/time-to-hire`, (res, _url, range) => ok(res, reportsTimeToHire(range))]
]);

/**
 * GET /hire/admin/reports/overview/{jobs,applications,hired,rejected,time-to-hire,filter-options}: what sits
 * behind the five stat cards of the Reports Overview. The lists and time-to-hire take ?range=7d|30d|90d,
 * 30d when it is left out and a 422 for anything else; time-to-hire reads nothing but the range and
 * filter-options reads nothing at all, so any other parameter is ignored. Returns false for every other
 * route and every other method, so the caller hands them on to handleAdminReportsMock.
 */
export function handleReportsDrilldownMock(
  res: ServerResponse,
  path: string,
  method: string,
  url: URL
): boolean {
  if (method !== 'GET') return false;
  if (path === FILTER_OPTIONS) {
    ok(res, reportsFilterOptions());
    return true;
  }
  const route = ROUTES.get(path);
  if (!route) return false;
  const range = parseReportsRange(url.searchParams.get('range'));
  if (!range) {
    invalidReportsRange(res);
    return true;
  }
  route(res, url, range);
  return true;
}
