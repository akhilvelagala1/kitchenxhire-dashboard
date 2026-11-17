import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleAdminApplicationsMock } from './mockAdminApplicationsApi.ts';
import { handleAdminJobSeekersMock } from './mockAdminJobSeekersApi.ts';
import { handleAdminJobsMock } from './mockAdminJobsApi.ts';
import { handleAdminBusinessesMock } from './mockAdminBusinessesApi.ts';
import { handleAdminCategoriesMock } from './mockAdminCategoriesApi.ts';
import { handleAdminRecruitersMock } from './mockAdminRecruitersApi.ts';
import { handleReportsDrilldownMock } from './mockAdminReportsDrilldownApi.ts';
import { handleAdminReportsMock } from './mockAdminReportsApi.ts';
import { handleAdminSettingsMock } from './mockAdminSettingsApi.ts';
import { handleAdminUsersMock } from './mockAdminUsersApi.ts';
import {
  hireAdminSearch,
  hireApplicationsTrend,
  hireDashboardSummary,
  hireOpenJobsByCategory,
  hireRecentApplications
} from './hireDashboardMock.ts';

function send(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

const ok = (res: ServerResponse, data: unknown) => send(res, 200, { success: true, data });

export async function handleHireMock(
  req: IncomingMessage,
  res: ServerResponse,
  path: string,
  method: string,
  url: URL
): Promise<boolean> {
  if (path === '/hire/dashboard/summary' && method === 'GET') {
    ok(res, hireDashboardSummary());
    return true;
  }
  if (path === '/hire/dashboard/applications-trend' && method === 'GET') {
    const range = url.searchParams.get('range') ?? '30d';
    ok(res, hireApplicationsTrend(range));
    return true;
  }
  if (path === '/hire/dashboard/recent-applications' && method === 'GET') {
    ok(res, hireRecentApplications());
    return true;
  }
  if (path === '/hire/dashboard/open-jobs-by-category' && method === 'GET') {
    ok(res, hireOpenJobsByCategory());
    return true;
  }
  if (path === '/hire/admin/search' && method === 'GET') {
    const q = url.searchParams.get('q') ?? '';
    ok(res, hireAdminSearch(q));
    return true;
  }
  if (path.startsWith('/hire/admin/jobs')) {
    return handleAdminJobsMock(req, res, path, method, url);
  }
  if (path.startsWith('/hire/admin/applications')) {
    return handleAdminApplicationsMock(req, res, path, method, url);
  }
  if (path.startsWith('/hire/admin/recruiters')) {
    return handleAdminRecruitersMock(req, res, path, method, url);
  }
  if (path.startsWith('/hire/admin/businesses')) {
    return handleAdminBusinessesMock(req, res, path, method, url);
  }
  if (path.startsWith('/hire/admin/job-seekers')) {
    return handleAdminJobSeekersMock(req, res, path, method, url);
  }
  if (path.startsWith('/hire/admin/categories') || path.startsWith('/hire/admin/roles')) {
    return handleAdminCategoriesMock(req, res, path, method, url);
  }
  if (path.startsWith('/hire/admin/users')) {
    return handleAdminUsersMock(req, res, path, method, url);
  }
  if (path.startsWith('/hire/admin/reports')) {
    // The stat-card routes under /overview/ first; handleAdminReportsMock takes the rest.
    return (
      handleReportsDrilldownMock(res, path, method, url) ||
      handleAdminReportsMock(res, path, method, url)
    );
  }
  if (path.startsWith('/hire/admin/settings')) {
    return handleAdminSettingsMock(req, res, path, method);
  }
  return false;
}
