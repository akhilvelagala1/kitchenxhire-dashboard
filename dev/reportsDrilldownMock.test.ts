import { describe, expect, it, vi } from 'vitest';
import {
  HIRE_APPLICATION_STATUSES,
  getApplicationsStore,
  type HireApplicationStatus
} from './applicationsMockData.ts';
import {
  reportsApplicationRows,
  reportsHiredRows,
  reportsRejectedRows
} from './reportsDrilldownLedger.ts';
import { REJECTION_REASONS, reportsJobRows } from './reportsDrilldownMockData.ts';
import { LISTS, get, sum } from './reportsDrilldownTestKit.ts';
import { REPORT_RANGES, reportsOverview } from './reportsMockData.ts';

const DAY_MS = 24 * 60 * 60_000;

describe.each(REPORT_RANGES)('the stat-card lists for %s', (range) => {
  const overview = reportsOverview(range);
  const { kpis } = overview;

  it.each(LISTS)('hold as many $path as their card says', ({ path, kpi }) => {
    const { status, json } = get(path, { range });

    expect(status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.meta).toEqual({ page: 1, page_size: 5, total: kpis[kpi].value });
    expect(json.data).toHaveLength(5);
  });

  it('count each status as the Overview donut does', () => {
    const total = (status: HireApplicationStatus) =>
      get('applications', { range, status }).json.meta.total as number;
    const slice = (name: string) =>
      overview.application_status.find((s) => s.status === name)?.count;

    expect(total('hired')).toBe(kpis.hired.value);
    expect(total('rejected')).toBe(kpis.rejected.value);
    expect(total('shortlisted') + total('interview_scheduled')).toBe(slice('shortlisted'));
    expect(total('pending_review') + total('reviewed')).toBe(slice('under_review'));
    expect(sum(HIRE_APPLICATION_STATUSES.map((status) => total(status)))).toBe(
      kpis.applications.value
    );
  });

  it('count the jobs of each category as Top Job Categories does', () => {
    const total = (category: string) =>
      get('jobs', { range, job_category: category }).json.meta.total as number;
    const listed = overview.top_categories;

    for (const { label, count } of listed) expect(total(label)).toBe(count);
    // The ranking shows the top categories only, so the rest of the jobs sit in the one it leaves out.
    expect(total('Restaurant Manager')).toBe(
      kpis.jobs_posted.value - sum(listed.map((category) => category.count))
    );
  });

  it('keep every row inside the window, newest first, with ids that are all different', () => {
    const { from, to } = overview.range;
    const jobs = reportsJobRows(range);
    const applications = reportsApplicationRows(range);
    const hired = reportsHiredRows(range);
    const rejected = reportsRejectedRows(range);
    const sets = [
      { dates: jobs.map((r) => r.posted_at), ids: jobs.map((r) => r.job_id) },
      {
        dates: applications.map((r) => r.applied_at),
        ids: applications.map((r) => r.application_id)
      },
      { dates: hired.map((r) => r.hired_at), ids: hired.map((r) => r.application_id) },
      { dates: rejected.map((r) => r.rejected_at), ids: rejected.map((r) => r.application_id) }
    ];

    for (const { dates, ids } of sets) {
      expect(dates.every((d) => d.slice(0, 10) >= from && d.slice(0, 10) <= to)).toBe(true);
      expect(dates.every((d, i) => i === 0 || dates[i - 1] >= d)).toBe(true);
      expect(dates.every((d) => d.endsWith('+05:30'))).toBe(true);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('give the Hired and Rejected lists exactly the applications that have those statuses', () => {
    const applications = reportsApplicationRows(range);
    const byId = new Map(applications.map((row) => [row.application_id, row]));
    const differs = (
      row: {
        application_id: string;
        candidate_name: string;
        job_title: string;
        outlet_name: string;
      },
      status: string
    ) => {
      const application = byId.get(row.application_id);
      return (
        application?.status !== status ||
        application.candidate_name !== row.candidate_name ||
        application.job_title !== row.job_title ||
        application.outlet_name !== row.outlet_name
      );
    };

    expect(reportsHiredRows(range).filter((row) => differs(row, 'hired'))).toEqual([]);
    expect(reportsRejectedRows(range).filter((row) => differs(row, 'rejected'))).toEqual([]);
    expect(applications.filter((row) => row.status === 'hired')).toHaveLength(
      reportsHiredRows(range).length
    );
  });

  it('never hire an application before it came in', () => {
    const appliedAt = new Map(
      reportsApplicationRows(range).map((row) => [row.application_id, row.applied_at])
    );
    const early = reportsHiredRows(range).filter(
      (row) => Date.parse(row.hired_at) < Date.parse(appliedAt.get(row.application_id) ?? '')
    );

    expect(early).toEqual([]);
  });

  it('name a reason from the fixed list for the rejections, and none for about 6 percent', () => {
    const reasons = reportsRejectedRows(range).map((row) => row.rejection_reason);
    const unrecorded = reasons.filter((reason) => reason === null).length / reasons.length;
    const allowed: readonly (string | null)[] = [...REJECTION_REASONS, null];

    expect(reasons.every((reason) => allowed.includes(reason))).toBe(true);
    expect(unrecorded).toBeGreaterThan(0.04);
    expect(unrecorded).toBeLessThan(0.08);
  });

  it('give the same rows when asked again', () => {
    for (const { path } of LISTS) {
      expect(get(path, { range, page: 3 })).toEqual(get(path, { range, page: 3 }));
    }
  });
});

describe('the records of the mock', () => {
  it('are built the same way every time, from nothing but the Overview and the Applications mock', async () => {
    const before = [reportsJobRows('30d'), reportsApplicationRows('30d'), reportsHiredRows('30d')];
    vi.resetModules();
    const data = await import('./reportsDrilldownMockData.ts');
    const ledger = await import('./reportsDrilldownLedger.ts');

    expect(data.reportsJobRows('30d')).toEqual(before[0]);
    expect(ledger.reportsApplicationRows('30d')).toEqual(before[1]);
    expect(ledger.reportsHiredRows('30d')).toEqual(before[2]);
  });

  it('use the candidates, outlets and recruiters of the Applications mock, in the id formats of the app', () => {
    const store = getApplicationsStore();
    const people = new Set(store.map((a) => `${a.candidate_id} ${a.candidate_name}`));
    const outlets = new Set(store.map((a) => a.outlet_name));
    const recruiters = new Set(store.map((a) => a.recruiter_name));
    const hired = reportsHiredRows('30d');
    const jobs = reportsJobRows('30d');

    expect(hired.filter((r) => !people.has(`${r.candidate_id} ${r.candidate_name}`))).toEqual([]);
    expect(hired.filter((r) => !outlets.has(r.outlet_name))).toEqual([]);
    expect(hired.filter((r) => !recruiters.has(r.recruiter_name))).toEqual([]);
    expect(
      jobs.filter((r) => !outlets.has(r.outlet_name) || !recruiters.has(r.recruiter_name))
    ).toEqual([]);
    expect(jobs.every((r) => /^JOB\d{5}$/.test(r.job_id))).toBe(true);
    expect(jobs[0].job_id).toBe('JOB10293');
    expect(reportsApplicationRows('30d').every((r) => /^APP\d{5}$/.test(r.application_id))).toBe(
      true
    );
    expect(hired.every((r) => /^CAN\d{5}$/.test(r.candidate_id))).toBe(true);
  });

  it.each([
    ['30d', 6.8],
    ['90d', 7.4]
  ] as const)('make the hires of %s wait about the card average, %s days', (range, card) => {
    const appliedAt = new Map(
      reportsApplicationRows(range).map((row) => [row.application_id, row.applied_at])
    );
    const waits = reportsHiredRows(range).map(
      (row) =>
        (Date.parse(row.hired_at) - Date.parse(appliedAt.get(row.application_id) ?? '')) / DAY_MS
    );

    expect(Math.abs(sum(waits) / waits.length - card)).toBeLessThan(0.1);
  });
});
