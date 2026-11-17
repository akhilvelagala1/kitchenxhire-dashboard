import { describe, expect, it } from 'vitest';
import {
  businessLocations,
  businessesSummary,
  businessesTrend,
  filterBusinesses,
  listBusinesses,
  pickBusinessFilters
} from './businessesAnalytics.ts';
import { getBusinessesStore } from './businessesMockData.ts';

const rows = getBusinessesStore();
const ids = (items: { business_id: string }[]) => items.map((r) => r.business_id);

describe('businesses summary', () => {
  it('counts the store and carries the fixed card figures', () => {
    expect(businessesSummary(rows)).toEqual({
      total: 642,
      active: 586,
      inactive: 36,
      outlets: 1428,
      active_outlets: 1312,
      warehouses: 24,
      growth_pct: {
        total: 14,
        active: 12,
        inactive: -5,
        outlets: 18,
        active_outlets: 16,
        warehouses: 9
      }
    });
  });

  it('gives each tab a count equal to its list total, with under review and suspended in All only', () => {
    const summary = businessesSummary(rows);
    const total = (tab: string) => listBusinesses(rows, { tab }).meta.total;

    expect(total('all')).toBe(summary.total);
    expect(total('active')).toBe(summary.active);
    expect(total('inactive')).toBe(summary.inactive);
    expect(summary.total - summary.active - summary.inactive).toBe(20);
    expect(listBusinesses(rows, { status: 'under_review' }).meta.total).toBe(12);
    expect(listBusinesses(rows, { status: 'suspended' }).meta.total).toBe(8);
  });
});

describe('businesses list', () => {
  it('lists all 642 with no joined filter, in 65 pages of 10', () => {
    const { meta } = listBusinesses(rows, {});

    expect(meta).toEqual({ page: 1, page_size: 10, total: 642 });
    expect(listBusinesses(rows, { page: 65 }).items).toHaveLength(2);
    expect(listBusinesses(rows, { page: 66 }).items).toEqual([]);
  });

  it('filters by status, verification, type, city and window, and combines them', () => {
    expect(listBusinesses(rows, { status: 'under_review' }).meta.total).toBe(12);
    expect(listBusinesses(rows, { status: 'suspended' }).meta.total).toBe(8);
    expect(listBusinesses(rows, { verification: 'verified' }).meta.total).toBeGreaterThan(0);
    expect(listBusinesses(rows, { business_type: 'Warehouse' }).meta.total).toBe(24);
    expect(listBusinesses(rows, { tab: 'inactive', status: 'active' }).meta.total).toBe(0);
    expect(
      listBusinesses(rows, { business_type: 'all', status: 'all', tab: 'all' }).meta.total
    ).toBe(642);
    expect(
      listBusinesses(rows, { city: 'Warangal', page_size: 100 }).items.every(
        (r) => r.city === 'Warangal'
      )
    ).toBe(true);
    const week = listBusinesses(rows, { joined: '7d', page_size: 100 }).items;
    expect(week.length).toBeGreaterThan(0);
    expect(week.length).toBeLessThan(642);
    expect(week.every((r) => r.joined_at >= '2024-06-18T00:00:00+05:30')).toBe(true);
    expect(ids(week).slice(0, 4)).toEqual(['BUS0642', 'BUS0641', 'BUS0640', 'BUS0639']);
  });

  it('searches name, owner, area and id, ignoring case', () => {
    expect(ids(listBusinesses(rows, { search: 'spice bowl' }).items)).toContain('BUS0642');
    expect(ids(listBusinesses(rows, { search: 'SANGEETHA' }).items)).toEqual(['BUS0639']);
    expect(
      ids(listBusinesses(rows, { search: 'gachibowli', business_type: 'Restaurant' }).items)
    ).toContain('BUS0638');
    expect(ids(listBusinesses(rows, { search: 'bus0641' }).items)).toEqual(['BUS0641']);
    expect(listBusinesses(rows, { search: 'zzzz-nothing' }).meta.total).toBe(0);
  });

  it('sorts by name, id or join date in either direction and clamps paging', () => {
    const byName = listBusinesses(rows, { sort: 'business_name', order: 'asc', page_size: 100 });
    const names = byName.items.map((r) => r.business_name);

    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, 'en')));
    expect(ids(listBusinesses(rows, { sort: 'business_id', order: 'asc' }).items)).toEqual([
      'BUS0001',
      'BUS0002',
      'BUS0003',
      'BUS0004',
      'BUS0005',
      'BUS0006',
      'BUS0007',
      'BUS0008',
      'BUS0009',
      'BUS0010'
    ]);
    expect(
      listBusinesses(rows, { sort: 'joined_at', order: 'asc' }).items[0]!.joined_at <= '2024-05-27'
    ).toBe(true);
    expect(listBusinesses(rows, { page: -3, page_size: 500 }).meta).toMatchObject({
      page: 1,
      page_size: 100
    });
    expect(listBusinesses(rows, { page: Number.NaN, page_size: 0 }).meta).toMatchObject({
      page: 1,
      page_size: 10
    });
  });

  it('ignores an unknown tab, sort or window instead of failing', () => {
    expect(filterBusinesses(rows, { tab: 'archived', joined: 'forever' })).toHaveLength(642);
    expect(listBusinesses(rows, { sort: 'phone' }).items[0]?.business_id).toBe('BUS0642');
  });

  it('reads filters from a query or body, trimming and dropping blanks and non-strings', () => {
    expect(
      pickBusinessFilters({
        tab: ' active ',
        status: '',
        city: 5,
        search: '  ',
        verification: ' pending ',
        joined: '30d',
        page: 2
      })
    ).toEqual({ tab: 'active', verification: 'pending', joined: '30d' });
  });
});

describe('businesses locations', () => {
  it('lists each city once, sorted, as value and label', () => {
    const cities = businessLocations(rows);

    expect(cities).toContainEqual({ value: 'Hyderabad', label: 'Hyderabad' });
    expect(cities.map((c) => c.value)).toEqual(
      [...new Set(cities.map((c) => c.value))].sort((a, b) => a.localeCompare(b, 'en'))
    );
    expect(cities.every((c) => c.value === c.label)).toBe(true);
  });
});

describe('businesses trend', () => {
  it('gives seven points ending on 642 at 24 Jun 2024 for the picture range', () => {
    const points = businessesTrend('30d');

    expect(points).toHaveLength(7);
    expect(points.map((p) => p.date)).toEqual([
      '2024-05-25',
      '2024-05-30',
      '2024-06-04',
      '2024-06-09',
      '2024-06-14',
      '2024-06-19',
      '2024-06-24'
    ]);
    expect(points[0]!.count).toBe(569);
    expect(points.at(-1)).toEqual({ date: '2024-06-24', count: 642 });
    expect(points.every((p) => p.count >= 500 && p.count <= 720)).toBe(true);
  });

  it('keeps 7 and 90 days rising and ending on the same total', () => {
    for (const range of ['7d', '90d', 'anything']) {
      const points = businessesTrend(range);
      const counts = points.map((p) => p.count);

      expect(points).toHaveLength(7);
      expect(points.at(-1)).toEqual({ date: '2024-06-24', count: 642 });
      expect(counts).toEqual([...counts].sort((a, b) => a - b));
      expect(counts.every((c) => c >= 400 && c <= 720)).toBe(true);
    }
    expect(businessesTrend('7d')[0]!.date).toBe('2024-06-18');
    expect(businessesTrend('90d')[0]!.date).toBe('2024-03-26');
    expect(businessesTrend('nope')).toEqual(businessesTrend('30d'));
  });
});
