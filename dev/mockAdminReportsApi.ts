import type { ServerResponse } from 'node:http';
import { invalid, ok } from './categoriesHttp.ts';
import { applicationsReport } from './reportsApplicationsMockData.ts';
import { jobsReport } from './reportsJobsMockData.ts';
import { REPORT_RANGES, parseReportsRange, reportsOverview } from './reportsMockData.ts';
import { recruitersReport } from './reportsRecruitersMockData.ts';
import { usersReport } from './reportsUsersMockData.ts';

const OVERVIEW = '/hire/admin/reports/overview';
const JOBS = '/hire/admin/reports/jobs';
const APPLICATIONS = '/hire/admin/reports/applications';
const USERS = '/hire/admin/reports/users';
const RECRUITERS = '/hire/admin/reports/recruiters';

/** The 422 for a range that is not 7d, 30d or 90d. The export route in mockApi.ts answers with it too. */
export function invalidReportsRange(res: ServerResponse) {
  invalid(res, 'Choose a valid date range.', {
    range: `Range must be one of: ${REPORT_RANGES.join(', ')}.`
  });
}

/**
 * GET /hire/admin/reports/overview, /jobs, /applications, /users and /recruiters, all
 * ?range=7d|30d|90d. The range defaults to 30d when it is left out and is a 422 when it is anything
 * else (case counts: 30D is not 30d). Returns false for every other route, including POST /exports and
 * GET /export-result/:id, which the caller serves with reportsCsv, and the stat-card routes under
 * /overview/ (jobs, applications, hired, rejected, time-to-hire, filter-options), which
 * mockAdminReportsDrilldownApi.ts answers and mockHireApi.ts asks first.
 */
export function handleAdminReportsMock(
  res: ServerResponse,
  path: string,
  method: string,
  url: URL
): boolean {
  const known =
    path === OVERVIEW ||
    path === JOBS ||
    path === APPLICATIONS ||
    path === USERS ||
    path === RECRUITERS;
  if (method !== 'GET' || !known) return false;
  const range = parseReportsRange(url.searchParams.get('range'));
  if (!range) {
    invalidReportsRange(res);
    return true;
  }
  if (path === OVERVIEW) ok(res, reportsOverview(range));
  else if (path === JOBS) ok(res, jobsReport(range));
  else if (path === APPLICATIONS) ok(res, applicationsReport(range));
  else if (path === USERS) ok(res, usersReport(range));
  else ok(res, recruitersReport(range));
  return true;
}
