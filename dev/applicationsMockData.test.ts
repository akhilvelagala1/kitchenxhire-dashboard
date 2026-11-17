import { describe, expect, it } from 'vitest';
import {
  applicationsSummary,
  filterApplications,
  listApplications
} from './applicationsAnalytics.ts';
import {
  APPLICATION_TABS,
  buildApplications,
  getApplicationJobs,
  getApplicationsStore,
  updateApplication
} from './applicationsMockData.ts';
import { getJobsStore } from './jobsMockData.ts';

const rows = getApplicationsStore();
const ids = (items: { application_id: string }[]) => items.map((r) => r.application_id);

describe('mock applications store', () => {
  it('holds 8,672 applications with unique ids counting down from APP10892 to APP02221', () => {
    expect(rows).toHaveLength(8672);
    expect(new Set(ids(rows)).size).toBe(8672);
    expect(rows[0]?.application_id).toBe('APP10892');
    expect(rows.at(-1)?.application_id).toBe('APP02221');
  });

  it('serves the five reference rows, in order, as the default first page', () => {
    const { items, meta } = listApplications(rows, { page: 1, page_size: 5 });

    expect(meta).toEqual({ page: 1, page_size: 5, total: 8672 });
    expect(
      items.map((r) => [
        r.application_id,
        r.candidate_name,
        r.candidate_location,
        r.job_title,
        r.job_type,
        r.outlet_name,
        r.recruiter_name,
        r.applied_at,
        r.status
      ])
    ).toEqual([
      [
        'APP10892',
        'Rahul Kumar',
        'Hyderabad, TS',
        'Cook / Chef',
        'Full-time',
        'Spice Bowl Restaurant',
        'Rahul Verma',
        '2026-06-24T10:24:00+05:30',
        'reviewed'
      ],
      [
        'APP10891',
        'Priya Sharma',
        'Hyderabad, TS',
        'Kitchen Helper',
        'Full-time',
        'Urban Bites',
        'Anita Rao',
        '2026-06-24T09:18:00+05:30',
        'shortlisted'
      ],
      [
        'APP10890',
        'Amit Mishra',
        'Secunderabad, TS',
        'Cleaning & Stewarding',
        'Part-time',
        'The Food Court',
        'Vikram Singh',
        '2026-06-23T17:42:00+05:30',
        'interview_scheduled'
      ],
      [
        'APP10889',
        'Suresh Das',
        'Hyderabad, TS',
        'Delivery & Store Support',
        'Full-time',
        'Tasty Point',
        'Neha Patel',
        '2026-06-22T11:03:00+05:30',
        'hired'
      ],
      [
        'APP10888',
        'Neha Jain',
        'Hyderabad, TS',
        'Restaurant Manager',
        'Full-time',
        'Meal Hub',
        'Arjun Mehta',
        '2026-06-20T16:22:00+05:30',
        'pending_review'
      ]
    ]);
  });

  it('holds exactly as many applications for each job as the Jobs dashboard counts for it', () => {
    const perJob = new Map<string, number>();
    for (const r of rows) perJob.set(r.job_id, (perJob.get(r.job_id) ?? 0) + 1);

    const wrong = getJobsStore().filter((job) => perJob.get(job.job_id) !== job.applications_count);
    expect(wrong.map((job) => job.job_id)).toEqual([]);
    expect(rows.slice(0, 5).map((r) => r.job_id)).toEqual(
      getJobsStore()
        .slice(0, 5)
        .map((j) => j.job_id)
    );
  });

  it('steps back 25 to 110 minutes per generated row, so applied_at strictly decreases', () => {
    const gaps = rows
      .slice(5)
      .map((r, i) => Date.parse(rows[i + 4]!.applied_at) - Date.parse(r.applied_at));

    expect(Math.min(...gaps)).toBeGreaterThanOrEqual(25 * 60_000);
    expect(Math.max(...gaps)).toBeLessThanOrEqual(110 * 60_000);
  });

  it('generates realistic candidates, jobs and interview times', () => {
    expect(rows.every((r) => /^[6-9]\d{9}$/.test(r.candidate_phone))).toBe(true);
    expect(rows.every((r) => r.candidate_email.endsWith('@example.com'))).toBe(true);
    expect(rows.every((r) => /, (TS|AP|KA)$/.test(r.candidate_location))).toBe(true);
    expect(new Set(rows.map((r) => r.job_id)).size).toBe(428);
    expect(new Set(rows.map((r) => r.recruiter_id)).size).toBe(312);
    expect(new Set(getApplicationJobs().map((j) => j.location)).size).toBe(4);

    const interviews = rows.filter(
      (r) => r.status === 'interview_scheduled' || r.status === 'hired'
    );
    expect(rows.filter((r) => r.interview_at).length).toBe(interviews.length);
    expect(interviews.every((r) => Date.parse(r.interview_at!) > Date.parse(r.applied_at))).toBe(
      true
    );

    const withResume = rows.filter((r) => r.resume_file_name).length / rows.length;
    expect(withResume).toBeGreaterThan(0.8);
    expect(withResume).toBeLessThan(0.9);
    expect(rows[0]?.resume_file_name).toBe('Rahul_Kumar_Resume.pdf');
  });

  it('gives identical data on every build', () => {
    expect(buildApplications()).toEqual(buildApplications());
    expect(buildApplications()).toEqual(rows);
  });

  it('clears the interview time when an application leaves Interview Scheduled or Hired', () => {
    const row = rows.find((r) => r.application_id === 'APP10889')!;
    const moved = updateApplication('APP10889', { status: 'rejected' });

    expect(moved?.interview_at).toBeNull();
    updateApplication('APP10889', { status: 'hired', interview_at: row.interview_at! });
    expect(rows.find((r) => r.application_id === 'APP10889')?.interview_at).toBe(row.interview_at);
  });
});

describe('applications summary', () => {
  it('counts the tabs as on the reference screen', () => {
    const { counts, growth_pct } = applicationsSummary(rows);

    expect(counts).toEqual({
      all: 8672,
      reviewed: 6142,
      shortlisted: 1460,
      interview_scheduled: 642,
      hired: 428,
      rejected: 856
    });
    expect(growth_pct).toEqual({
      all: 18,
      reviewed: 16,
      shortlisted: 9,
      interview_scheduled: 14,
      hired: 12,
      rejected: 8
    });
  });

  it('holds the exact current-status quotas', () => {
    const count = (status: string) => filterApplications(rows, { status }).length;

    expect([
      count('pending_review'),
      count('reviewed'),
      count('shortlisted'),
      count('interview_scheduled'),
      count('hired'),
      count('rejected')
    ]).toEqual([1674, 4682, 818, 214, 428, 856]);
  });

  it('gives every tab a list total equal to its summary count', () => {
    const { counts } = applicationsSummary(rows);

    for (const tab of APPLICATION_TABS) {
      expect(listApplications(rows, { tab }).meta.total).toBe(counts[tab]);
    }
  });
});

describe('applications list filters', () => {
  it('combines a tab with an exact status as an intersection', () => {
    expect(listApplications(rows, { tab: 'reviewed', status: 'hired' }).meta.total).toBe(428);
    expect(listApplications(rows, { tab: 'reviewed', status: 'shortlisted' }).meta.total).toBe(818);
    expect(listApplications(rows, { tab: 'hired', status: 'rejected' }).meta.total).toBe(0);
    expect(listApplications(rows, { tab: 'all', status: 'all' }).meta.total).toBe(8672);
  });

  it('ends on page 1,735 with two rows when the page size is five', () => {
    const last = listApplications(rows, { page: 1735, page_size: 5 });

    expect(ids(last.items)).toEqual(['APP02222', 'APP02221']);
    expect(listApplications(rows, { page: 1736, page_size: 5 }).items).toEqual([]);
  });

  it('finds an application by id, name, phone and e-mail, ignoring case', () => {
    const rahul = rows[0]!;

    expect(ids(listApplications(rows, { search: 'app10892' }).items)).toEqual(['APP10892']);
    expect(ids(listApplications(rows, { search: 'RAHUL KUMAR' }).items)).toContain('APP10892');
    expect(ids(listApplications(rows, { search: rahul.candidate_phone }).items)).toContain(
      'APP10892'
    );
    expect(ids(listApplications(rows, { search: rahul.candidate_email }).items)).toContain(
      'APP10892'
    );
    expect(listApplications(rows, { search: 'no such candidate' }).meta.total).toBe(0);
  });

  it('filters by job, recruiter and the city of the job', () => {
    const job = filterApplications(rows, { job_id: 'JOB10293' });
    const recruiter = filterApplications(rows, { recruiter_id: 'REC001' });
    const city = filterApplications(rows, { location: 'Secunderabad' });

    expect(job.length).toBeGreaterThan(0);
    expect(job.every((r) => r.job_title === 'Cook / Chef')).toBe(true);
    expect(recruiter.every((r) => r.recruiter_name === 'Rahul Verma')).toBe(true);
    expect(city.every((r) => r.location === 'Secunderabad')).toBe(true);
    expect(ids(filterApplications(rows, { job_id: 'JOB10293', location: 'Warangal' }))).toEqual([]);
  });

  it('filters by India-time dates, both ends included', () => {
    expect(ids(listApplications(rows, { from: '2026-06-24', to: '2026-06-24' }).items)).toEqual([
      'APP10892',
      'APP10891'
    ]);
    expect(ids(listApplications(rows, { from: '2026-06-22', to: '2026-06-23' }).items)).toEqual([
      'APP10890',
      'APP10889'
    ]);
    expect(listApplications(rows, { to: '2026-06-21' }).meta.total).toBe(8668);
  });

  it('sorts by candidate name and by id, in both directions', () => {
    const names = listApplications(rows, {
      sort: 'candidate_name',
      order: 'asc',
      page_size: 100
    }).items;
    const sorted = [...names].sort((a, b) =>
      a.candidate_name.localeCompare(b.candidate_name, 'en')
    );

    expect(names.map((r) => r.candidate_name)).toEqual(sorted.map((r) => r.candidate_name));
    expect(ids(listApplications(rows, { sort: 'application_id', order: 'asc' }).items)[0]).toBe(
      'APP02221'
    );
    expect(ids(listApplications(rows, { sort: 'applied_at', order: 'asc' }).items)[0]).toBe(
      'APP02221'
    );
    expect(ids(listApplications(rows, { sort: 'application_id', order: 'desc' }).items)[0]).toBe(
      'APP10892'
    );
  });

  it('keeps the page size between 1 and 100', () => {
    expect(listApplications(rows, { page_size: 500 }).items).toHaveLength(100);
    expect(listApplications(rows, { page_size: 0 }).meta.page_size).toBe(5);
  });
});
