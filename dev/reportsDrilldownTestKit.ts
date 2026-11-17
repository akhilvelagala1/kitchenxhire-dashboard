/**
 * What the tests of the Reports Overview stat-card mock share: a tiny fake response to call the route
 * handler with, the four lists with the KPI whose number each one carries, and a few small readers.
 */
import type { ServerResponse } from 'node:http';
import { handleReportsDrilldownMock } from './mockAdminReportsDrilldownApi.ts';

export const BASE = '/hire/admin/reports/overview';

export const sum = (values: readonly number[]) => values.reduce((a, b) => a + b, 0);

/** The four cards that open a list, with the path of their list and the KPI whose number they carry. */
export const LISTS = [
  { path: 'jobs', kpi: 'jobs_posted' },
  { path: 'applications', kpi: 'applications' },
  { path: 'hired', kpi: 'hired' },
  { path: 'rejected', kpi: 'rejected' }
] as const;

export function fakeResponse() {
  return {
    statusCode: 200,
    text: '',
    setHeader: () => undefined,
    end(chunk?: string) {
      this.text = chunk ?? '';
    }
  };
}

/** Calls the drilldown handler with a tiny fake response, and parses what it wrote. */
export function call(target: string, method = 'GET') {
  const url = new URL(target, 'http://localhost');
  const res = fakeResponse();
  const handled = handleReportsDrilldownMock(
    res as unknown as ServerResponse,
    url.pathname,
    method,
    url
  );
  return { handled, status: res.statusCode, json: res.text ? JSON.parse(res.text) : undefined };
}

/** GET /overview/<path> with the parameters, URL-encoded. */
export const get = (path: string, params: Record<string, string | number> = {}) =>
  call(
    `${BASE}/${path}?${new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]))}`
  );

/** The ids of the rows of a page: the job id of a job, the application id of the rest. */
export const idsOf = (json: { data: { job_id?: string; application_id?: string }[] }) =>
  json.data.map((row) => row.job_id ?? row.application_id);
