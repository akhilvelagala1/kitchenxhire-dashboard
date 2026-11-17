import { describe, expect, it } from 'vitest';
import { jobsByCategory, jobsSummary, jobsTrend } from './jobsAnalytics.ts';
import { getJobsStore } from './jobsMockData.ts';

/** The window the Jobs page asks for by default: today and the 29 days before it. */
function last30Days() {
  const now = new Date();
  const to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const from = new Date(to);
  from.setDate(from.getDate() - 29);
  from.setHours(0, 0, 0, 0);
  return { from, to };
}

function inLast30Days() {
  const { from, to } = last30Days();
  return getJobsStore().filter((j) => {
    const t = new Date(j.posted_at).getTime();
    return t >= from.getTime() && t <= to.getTime();
  });
}

describe('mock jobs store', () => {
  it('seeds the totals shown on the reference screen', () => {
    expect(jobsSummary(inLast30Days())).toMatchObject({
      total_jobs: 428,
      total_applications: 8672,
      total_recruiters: 312,
      total_recruited: 642,
      closed_jobs: 52,
      active_jobs: 278,
      under_review_jobs: 48,
      paused_jobs: 32,
      draft_jobs: 18
    });
  });

  it('gives every job a recruiter name', () => {
    expect(getJobsStore().every((j) => j.recruiter_name.length > 0)).toBe(true);
  });

  it('splits the jobs across the six categories as on the reference screen', () => {
    expect(jobsByCategory(inLast30Days()).map((c) => c.count)).toEqual([128, 96, 72, 54, 32, 46]);
  });

  it('keeps every job inside the default 30-day window', () => {
    expect(inLast30Days()).toHaveLength(getJobsStore().length);
  });

  it('gives every job its own id, with the five newest on the reference rows', () => {
    const jobs = getJobsStore();
    expect(new Set(jobs.map((j) => j.job_id)).size).toBe(jobs.length);

    const newest = [...jobs].sort((a, b) => b.posted_at.localeCompare(a.posted_at)).slice(0, 5);
    expect(newest.map((j) => j.job_id)).toEqual([
      'JOB10293',
      'JOB10292',
      'JOB10291',
      'JOB10290',
      'JOB10289'
    ]);
  });

  it('keeps recruited no higher than applications on every job', () => {
    expect(getJobsStore().every((j) => j.recruited_count <= j.applications_count)).toBe(true);
  });
});

describe('jobs dashboard numbers', () => {
  it('agrees across the summary, the categories and the last point of the trend', () => {
    const slice = inLast30Days();
    const trend = jobsTrend(slice, last30Days());

    const total = jobsSummary(slice).total_jobs;
    expect(jobsByCategory(slice).reduce((sum, c) => sum + c.count, 0)).toBe(total);
    expect(trend.at(-1)?.count).toBe(total);
  });

  it('draws one point per day, as a running total that never falls', () => {
    const trend = jobsTrend(inLast30Days(), last30Days());

    expect(trend).toHaveLength(30);
    expect(new Set(trend.map((p) => p.date)).size).toBe(30);
    trend.slice(1).forEach((p, i) => expect(p.count).toBeGreaterThanOrEqual(trend[i]!.count));
  });

  it('stays consistent for a shorter period too', () => {
    const { to } = last30Days();
    const from = new Date(to);
    from.setDate(from.getDate() - 6);
    from.setHours(0, 0, 0, 0);
    const slice = getJobsStore().filter((j) => {
      const t = new Date(j.posted_at).getTime();
      return t >= from.getTime() && t <= to.getTime();
    });

    const trend = jobsTrend(slice, { from, to });
    expect(trend).toHaveLength(7);
    expect(trend.at(-1)?.count).toBe(jobsSummary(slice).total_jobs);
    expect(jobsByCategory(slice).reduce((sum, c) => sum + c.count, 0)).toBe(slice.length);
  });

  it('labels each trend point with its local calendar day', () => {
    const trend = jobsTrend([], last30Days());

    expect(trend[0]?.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(trend.every((p) => p.count === 0)).toBe(true);
  });
});
