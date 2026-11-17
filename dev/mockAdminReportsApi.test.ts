import { describe, expect, it } from 'vitest';
import type { ServerResponse } from 'node:http';
import { handleAdminReportsMock } from './mockAdminReportsApi.ts';
import { applicationsReport } from './reportsApplicationsMockData.ts';
import { jobsReport } from './reportsJobsMockData.ts';
import { REPORT_RANGES, reportsOverview } from './reportsMockData.ts';
import { recruitersReport } from './reportsRecruitersMockData.ts';
import { usersReport } from './reportsUsersMockData.ts';

/** Calls the handler with a tiny fake response, and parses what it wrote. */
function call(method: string, target: string) {
  const url = new URL(target, 'http://localhost');
  const res = {
    statusCode: 200,
    text: '',
    setHeader: () => undefined,
    end(chunk?: string) {
      this.text = chunk ?? '';
    }
  };
  const handled = handleAdminReportsMock(
    res as unknown as ServerResponse,
    url.pathname,
    method,
    url
  );
  return { handled, status: res.statusCode, json: res.text ? JSON.parse(res.text) : undefined };
}

const OVERVIEW = '/hire/admin/reports/overview';
const JOBS = '/hire/admin/reports/jobs';
const APPLICATIONS = '/hire/admin/reports/applications';
const USERS = '/hire/admin/reports/users';
const RECRUITERS = '/hire/admin/reports/recruiters';

describe('admin reports mock API', () => {
  it('answers the 30-day overview of the picture when the range is left out', () => {
    const { handled, status, json } = call('GET', OVERVIEW);

    expect(handled).toBe(true);
    expect(status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.range).toEqual({ from: '2026-05-26', to: '2026-06-24' });
    expect(json.data.kpis.applications).toEqual({ value: 8672, change_pct: 18 });
    expect(json.data).toEqual(reportsOverview('30d'));
  });

  it.each(REPORT_RANGES)('answers the %s window with its own numbers', (range) => {
    const { status, json } = call('GET', `${OVERVIEW}?range=${range}`);

    expect(status).toBe(200);
    expect(json.data).toEqual(reportsOverview(range));
  });

  it('counts the 7-day and 90-day windows back from the same last day', () => {
    expect(call('GET', `${OVERVIEW}?range=7d`).json.data.range).toEqual({
      from: '2026-06-18',
      to: '2026-06-24'
    });
    expect(call('GET', `${OVERVIEW}?range=90d`).json.data.range).toEqual({
      from: '2026-03-27',
      to: '2026-06-24'
    });
  });

  it('refuses a range it does not know with 422 and names the field', () => {
    for (const range of ['14d', '30D', '', 'all']) {
      const { status, json } = call('GET', `${OVERVIEW}?range=${range}`);

      expect(status).toBe(422);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('VALIDATION_ERROR');
      expect(json.error.fields.range).toBe('Range must be one of: 7d, 30d, 90d.');
    }
  });

  it('leaves the export routes, other methods and unknown routes to the caller', () => {
    expect(call('POST', '/hire/admin/reports/exports').handled).toBe(false);
    expect(call('GET', '/hire/admin/reports/export-result/abc').handled).toBe(false);
    expect(call('POST', OVERVIEW).handled).toBe(false);
    expect(call('GET', '/hire/admin/reports').handled).toBe(false);
    expect(call('GET', '/hire/admin/other').handled).toBe(false);
  });

  it.each(REPORT_RANGES)('answers the Jobs Report %s window with its own numbers', (range) => {
    const { handled, status, json } = call('GET', `${JOBS}?range=${range}`);

    expect(handled).toBe(true);
    expect(status).toBe(200);
    expect(json.data).toEqual(jobsReport(range));
  });

  it('answers the 30-day Jobs Report when the range is left out, consistent with Overview', () => {
    const { json } = call('GET', JOBS);

    expect(json.data.kpis.total_jobs).toEqual({ value: 1482, change_pct: 12 });
    expect(
      json.data.jobs_status.reduce((sum: number, row: { count: number }) => sum + row.count, 0)
    ).toBe(1482);
  });

  it('refuses a Jobs Report range it does not know with 422', () => {
    const { status, json } = call('GET', `${JOBS}?range=14d`);

    expect(status).toBe(422);
    expect(json.error.fields.range).toBe('Range must be one of: 7d, 30d, 90d.');
  });

  it.each(REPORT_RANGES)(
    'answers the Applications Report %s window with its own numbers',
    (range) => {
      const { handled, status, json } = call('GET', `${APPLICATIONS}?range=${range}`);

      expect(handled).toBe(true);
      expect(status).toBe(200);
      expect(json.data).toEqual(applicationsReport(range));
    }
  );

  it('answers the 30-day Applications Report when the range is left out, consistent with Overview', () => {
    const { json } = call('GET', APPLICATIONS);

    expect(json.data.kpis.total_applications).toEqual({ value: 8672, change_pct: 18 });
    expect(json.data.kpis.hired).toEqual(reportsOverview('30d').kpis.hired);
    expect(json.data.application_status).toEqual(reportsOverview('30d').application_status);
  });

  it('refuses an Applications Report range it does not know with 422', () => {
    const { status, json } = call('GET', `${APPLICATIONS}?range=14d`);

    expect(status).toBe(422);
    expect(json.error.fields.range).toBe('Range must be one of: 7d, 30d, 90d.');
  });

  it.each(REPORT_RANGES)('answers the Users Report %s window with its own numbers', (range) => {
    const { handled, status, json } = call('GET', `${USERS}?range=${range}`);

    expect(handled).toBe(true);
    expect(status).toBe(200);
    expect(json.data).toEqual(usersReport(range));
  });

  it('answers the 30-day Users Report when the range is left out, consistent with Overview', () => {
    const { json } = call('GET', USERS);

    expect(json.data.kpis.job_seekers.value).toBe(
      reportsOverview('30d').platform_growth.at(-1)!.job_seekers
    );
    expect(json.data.kpis.recruiters.value).toBe(
      reportsOverview('30d').platform_growth.at(-1)!.recruiters
    );
    expect(
      json.data.users_by_type.reduce((sum: number, row: { count: number }) => sum + row.count, 0)
    ).toBe(json.data.kpis.total_users.value);
  });

  it('refuses a Users Report range it does not know with 422', () => {
    const { status, json } = call('GET', `${USERS}?range=14d`);

    expect(status).toBe(422);
    expect(json.error.fields.range).toBe('Range must be one of: 7d, 30d, 90d.');
  });

  it.each(REPORT_RANGES)('answers the Recruiter Report %s window with its own numbers', (range) => {
    const { handled, status, json } = call('GET', `${RECRUITERS}?range=${range}`);

    expect(handled).toBe(true);
    expect(status).toBe(200);
    expect(json.data).toEqual(recruitersReport(range));
  });

  it('answers the 30-day Recruiter Report when the range is left out, consistent with Overview and Users Report', () => {
    const { json } = call('GET', RECRUITERS);

    expect(json.data.kpis.total_recruiters.value).toBe(
      reportsOverview('30d').platform_growth.at(-1)!.recruiters
    );
    expect(
      json.data.recruiter_status.reduce((sum: number, row: { count: number }) => sum + row.count, 0)
    ).toBe(json.data.kpis.total_recruiters.value);
  });

  it('refuses a Recruiter Report range it does not know with 422', () => {
    const { status, json } = call('GET', `${RECRUITERS}?range=14d`);

    expect(status).toBe(422);
    expect(json.error.fields.range).toBe('Range must be one of: 7d, 30d, 90d.');
  });
});
