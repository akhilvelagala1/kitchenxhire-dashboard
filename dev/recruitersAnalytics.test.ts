import { describe, expect, it } from 'vitest';
import {
  filterRecruiters,
  listRecruiters,
  pickFilters,
  recruiterLocations,
  recruitersSummary,
  recruitersTrend
} from './recruitersAnalytics.ts';
import { getRecruitersStore } from './recruitersMockData.ts';

const rows = getRecruitersStore();
const ids = (items: { recruiter_id: string }[]) => items.map((r) => r.recruiter_id);

describe('recruiters summary', () => {
  it('counts the store and carries the fixed card figures', () => {
    expect(recruitersSummary(rows)).toEqual({
      total: 312,
      active: 286,
      inactive: 12,
      pending: 8,
      suspended: 6,
      outlets: 642,
      open_jobs: 1428,
      hiring_actions: 4862,
      growth_pct: {
        total: 7,
        active: 8,
        inactive: -4,
        pending: 12,
        suspended: -8,
        outlets: 14,
        open_jobs: 12,
        hiring_actions: 18
      }
    });
  });

  it('gives each tab a count equal to its list total', () => {
    const summary = recruitersSummary(rows);
    const total = (tab: string) => listRecruiters(rows, { tab }).meta.total;

    expect(total('all')).toBe(summary.total);
    expect(total('active')).toBe(summary.active);
    expect(total('inactive')).toBe(summary.inactive);
    expect(total('pending')).toBe(summary.pending);
    expect(total('suspended')).toBe(summary.suspended);
    expect(summary.active + summary.inactive + summary.pending + summary.suspended).toBe(
      summary.total
    );
  });
});

describe('recruiters list', () => {
  it('filters by status, business type, city and joined window, and combines them', () => {
    expect(listRecruiters(rows, { status: 'pending' }).meta.total).toBe(8);
    expect(listRecruiters(rows, { status: 'suspended' }).meta.total).toBe(6);
    expect(listRecruiters(rows, { business_type: 'Food Court' }).meta.total).toBe(63);
    expect(
      listRecruiters(rows, { city: 'Warangal' }).items.every((r) => r.city === 'Warangal')
    ).toBe(true);
    expect(listRecruiters(rows, { tab: 'inactive', status: 'active' }).meta.total).toBe(0);
    expect(
      listRecruiters(rows, { business_type: 'Restaurant', status: 'inactive' }).items.every(
        (r) => r.business_type === 'Restaurant' && r.status === 'inactive'
      )
    ).toBe(true);
  });

  it('keeps recruiters who last logged in within the last N days up to the end of 24 Jun, India time', () => {
    const week = listRecruiters(rows, { joined: '7d', page_size: 100 });
    expect(ids(week.items)).toEqual(
      expect.arrayContaining(['REC10892', 'REC10891', 'REC10890', 'REC10889'])
    );
    expect(week.meta.total).toBeGreaterThanOrEqual(4);
    const month = listRecruiters(rows, { joined: '30d', page_size: 100 });
    const quarter = listRecruiters(rows, { joined: '90d', page_size: 100 });

    expect(month.meta.total).toBeGreaterThan(20);
    expect(quarter.meta.total).toBeGreaterThanOrEqual(month.meta.total);
    expect(
      month.items.every(
        (r) => r.last_login_at !== null && r.last_login_at >= '2024-05-26T00:00:00+05:30'
      )
    ).toBe(true);
    expect(filterRecruiters(rows, { joined: 'whenever' })).toHaveLength(312);
  });

  it('searches company, id, email, phone and owner name, ignoring case', () => {
    expect(ids(listRecruiters(rows, { search: 'SPICE BOWL' }).items)).toContain('REC10892');
    expect(ids(listRecruiters(rows, { search: 'rec10891' }).items)).toEqual(['REC10891']);
    expect(ids(listRecruiters(rows, { search: 'priya.nair' }).items)).toContain('REC10891');
    expect(ids(listRecruiters(rows, { search: 'priya nair' }).items)).toEqual(['REC10891']);
    expect(listRecruiters(rows, { search: 'zzzz-nothing' }).meta.total).toBe(0);
  });

  it('sorts by joined date, business name or id, either way, ties broken by id', () => {
    expect(
      ids(listRecruiters(rows, { sort: 'joined_at', order: 'asc', page_size: 5 }).items)[0]
    ).toBe('REC10581');
    expect(
      ids(listRecruiters(rows, { sort: 'recruiter_id', order: 'asc', page_size: 5 }).items)
    ).toEqual(['REC10581', 'REC10582', 'REC10583', 'REC10584', 'REC10585']);
    const names = listRecruiters(rows, {
      sort: 'business_name',
      order: 'asc',
      page_size: 100
    }).items.map((r) => r.business_name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, 'en')));
    expect(ids(listRecruiters(rows, { sort: 'bogus' }).items)[0]).toBe('REC10892');
  });

  it('pages in tens by default, with 2 rows on the last of 32 pages, and caps a page at 100', () => {
    const last = listRecruiters(rows, { page: 32 });

    expect(last.items).toHaveLength(2);
    expect(last.meta).toEqual({ page: 32, page_size: 10, total: 312 });
    expect(listRecruiters(rows, { page: 33 }).items).toHaveLength(0);
    expect(listRecruiters(rows, { page_size: 500 }).items).toHaveLength(100);
    expect(listRecruiters(rows, { page: 0, page_size: 0 }).meta).toMatchObject({
      page: 1,
      page_size: 10
    });
  });

  it('reads filters from a request and leaves blank values out', () => {
    expect(
      pickFilters({ tab: 'active', city: '  ', search: ' spice ', page: 3, joined: 7 })
    ).toEqual({
      tab: 'active',
      search: 'spice'
    });
  });
});

describe('recruiter locations', () => {
  it('lists each city once, sorted, as value and label', () => {
    const cities = recruiterLocations(rows);

    expect(cities.every((c) => c.value === c.label)).toBe(true);
    expect(cities.map((c) => c.label)).toEqual([
      'Bengaluru',
      'Hyderabad',
      'Secunderabad',
      'Vijayawada',
      'Visakhapatnam',
      'Warangal'
    ]);
  });
});

describe('recruiters trend', () => {
  it('gives seven points for every range, and 30d for an unknown range', () => {
    for (const range of ['7d', '30d', '90d']) expect(recruitersTrend(range)).toHaveLength(7);
    expect(recruitersTrend('nonsense')).toEqual(recruitersTrend('30d'));
  });

  it('draws the 30-day levels from 25 May to 24 Jun, ending on 312', () => {
    const trend = recruitersTrend('30d');

    expect(trend.map((p) => p.date)).toEqual([
      '2024-05-25',
      '2024-05-30',
      '2024-06-04',
      '2024-06-09',
      '2024-06-14',
      '2024-06-19',
      '2024-06-24'
    ]);
    expect(trend.map((p) => p.count)).toEqual([192, 236, 232, 262, 268, 290, 312]);
  });

  it('draws the 7-day chart daily and the 90-day chart in 15-day steps, both ending on 312', () => {
    const week = recruitersTrend('7d');
    const quarter = recruitersTrend('90d');

    expect(week.map((p) => p.date)).toEqual([
      '2024-06-18',
      '2024-06-19',
      '2024-06-20',
      '2024-06-21',
      '2024-06-22',
      '2024-06-23',
      '2024-06-24'
    ]);
    expect(week.map((p) => p.count)).toEqual([286, 290, 294, 299, 303, 308, 312]);
    expect(quarter.map((p) => p.date)).toEqual([
      '2024-03-26',
      '2024-04-10',
      '2024-04-25',
      '2024-05-10',
      '2024-05-25',
      '2024-06-09',
      '2024-06-24'
    ]);
    expect(quarter[0]?.count).toBe(176);
    expect(quarter.at(-1)?.count).toBe(312);
  });

  it('keeps every level between 170 and 360 and never falls from one 90-day point to the next', () => {
    for (const range of ['7d', '30d', '90d']) {
      expect(recruitersTrend(range).every((p) => p.count >= 170 && p.count <= 360)).toBe(true);
    }
    const quarter = recruitersTrend('90d').map((p) => p.count);
    expect(quarter).toEqual([...quarter].sort((a, b) => a - b));
  });
});
