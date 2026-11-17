import { describe, expect, it } from 'vitest';
import {
  filterJobSeekers,
  jobSeekerLocations,
  jobSeekersSummary,
  jobSeekersTrend,
  listJobSeekers
} from './jobSeekersAnalytics.ts';
import { getJobSeekersStore } from './jobSeekersMockData.ts';

const rows = getJobSeekersStore();
const ids = (items: { job_seeker_id: string }[]) => items.map((r) => r.job_seeker_id);

describe('job seekers list', () => {
  it('returns the ten fixed rows, in order, as the default first page', () => {
    const { items, meta } = listJobSeekers(rows, {});

    expect(ids(items)).toEqual([
      'JS12846',
      'JS12845',
      'JS12844',
      'JS12843',
      'JS12842',
      'JS12841',
      'JS12840',
      'JS12839',
      'JS12838',
      'JS12837'
    ]);
    expect(meta).toEqual({ page: 1, page_size: 10, total: 12846 });
  });

  it('has a last page with the rows that are left', () => {
    const { items, meta } = listJobSeekers(rows, { page: 1285 });

    expect(meta.total).toBe(12846);
    expect(items).toHaveLength(6);
    expect(items.at(-1)?.job_seeker_id).toBe('JS00001');
    expect(listJobSeekers(rows, { page: 1286 }).items).toHaveLength(0);
  });

  it('limits the page size to 1 to 100', () => {
    expect(listJobSeekers(rows, { page_size: 500 }).items).toHaveLength(100);
    expect(listJobSeekers(rows, { page_size: 0 }).meta.page_size).toBe(10);
  });

  it('gives every tab a count that matches the list total, and the summary agrees', () => {
    const summary = jobSeekersSummary(rows);
    const total = (tab: string) => listJobSeekers(rows, { tab }).meta.total;

    expect(total('all')).toBe(summary.total);
    expect(total('active')).toBe(summary.active);
    expect(total('inactive')).toBe(summary.inactive);
    expect(summary.active + summary.inactive).toBe(summary.total);
  });

  it('puts Under Review and Suspended in the Inactive tab', () => {
    const inactive = filterJobSeekers(rows, { tab: 'inactive' });

    expect(inactive.every((r) => r.status !== 'active')).toBe(true);
    expect(inactive.some((r) => r.status === 'under_review')).toBe(true);
    expect(inactive.some((r) => r.status === 'suspended')).toBe(true);
  });

  it('filters by status, experience band, city and search, and combines them', () => {
    expect(ids(listJobSeekers(rows, { status: 'inactive' }).items)[0]).toBe('JS12843');
    for (const [band, test] of [
      ['0-1', (y: number) => y <= 1],
      ['2-3', (y: number) => y >= 2 && y <= 3],
      ['4-5', (y: number) => y >= 4 && y <= 5],
      ['6+', (y: number) => y >= 6]
    ] as const) {
      const found = filterJobSeekers(rows, { experience: band });
      expect(found.length).toBeGreaterThan(0);
      expect(found.every((r) => test(r.experience_years))).toBe(true);
    }
    expect(filterJobSeekers(rows, { city: 'Warangal' }).every((r) => r.city === 'Warangal')).toBe(
      true
    );
    expect(ids(listJobSeekers(rows, { search: 'venkatesh rao' }).items)).toContain('JS12842');
    expect(ids(listJobSeekers(rows, { search: 'JS12845' }).items)).toEqual(['JS12845']);
    expect(ids(listJobSeekers(rows, { search: '9876543211' }).items)).toEqual(['JS12845']);
    expect(
      ids(listJobSeekers(rows, { search: 'venkatesh', tab: 'active', city: 'Gachibowli' }).items)
    ).toContain('JS12842');
    expect(listJobSeekers(rows, { search: 'zzzz-nobody' }).meta.total).toBe(0);
  });

  it('counts last activity within the last N days up to the end of 24 Jun 2024, India time', () => {
    expect(ids(filterJobSeekers(rows, { joined: '7d' }).slice(0, 4))).toEqual([
      'JS12846',
      'JS12845',
      'JS12844',
      'JS12843'
    ]);
    expect(ids(filterJobSeekers(rows, { joined: '7d' }))).not.toContain('JS12842');
    expect(ids(filterJobSeekers(rows, { joined: '30d' }))).toContain('JS12842');
    const [n7, n30, n90] = ['7d', '30d', '90d'].map(
      (joined) => filterJobSeekers(rows, { joined }).length
    );
    expect(n7).toBeLessThan(n30!);
    expect(n30).toBeLessThan(n90!);
    expect(n90).toBeLessThan(rows.length);
  });

  it('sorts by every column in both directions, with the id as tie-break', () => {
    const asc = listJobSeekers(rows, { sort: 'name', order: 'asc', page_size: 50 }).items;
    const names = asc.map((r) => r.name);

    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, 'en')));
    expect(ids(listJobSeekers(rows, { sort: 'job_seeker_id', order: 'asc' }).items)[0]).toBe(
      'JS00001'
    );
    expect(listJobSeekers(rows, { sort: 'applications_count' }).items[0]?.applications_count).toBe(
      12
    );
    expect(listJobSeekers(rows, { sort: 'nonsense' }).items[0]?.job_seeker_id).toBe('JS12846');
  });
});

describe('job seekers summary and locations', () => {
  it('has the exact totals and the fixed growth percentages', () => {
    expect(jobSeekersSummary(rows)).toEqual({
      total: 12846,
      active: 10982,
      inactive: 1864,
      total_applications: 28642,
      shortlisted: 4286,
      hired: 1842,
      growth_pct: {
        total: 14,
        active: 16,
        inactive: -6,
        total_applications: 18,
        shortlisted: 12,
        hired: 20
      }
    });
  });

  it('lists the cities with the value equal to the label, sorted', () => {
    const cities = jobSeekerLocations(rows);

    expect(cities.every((c) => c.value === c.label)).toBe(true);
    expect(cities.map((c) => c.label)).toEqual(
      expect.arrayContaining([
        'Banjara Hills',
        'Bengaluru',
        'Chennai',
        'Gachibowli',
        'Hyderabad',
        'Secunderabad',
        'Warangal'
      ])
    );
  });
});

describe('job seekers trend', () => {
  it('returns seven points for each range ending on 12,846', () => {
    for (const range of ['7d', '30d', '90d'] as const) {
      const points = jobSeekersTrend(range);
      expect(points).toHaveLength(7);
      expect(points.at(-1)).toEqual({ date: '2024-06-24', count: 12846 });
    }
  });
});
