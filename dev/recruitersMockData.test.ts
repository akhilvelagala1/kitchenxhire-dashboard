import { describe, expect, it } from 'vitest';
import { recruitersSummary } from './recruitersAnalytics.ts';
import {
  BUSINESS_TYPES,
  RECRUITER_STATUSES,
  addRecruiter,
  buildRecruiters,
  findRecruiter,
  getRecruitersStore,
  updateRecruiter
} from './recruitersMockData.ts';

const rows = getRecruitersStore();
const count = (key: 'status' | 'business_type' | 'city', value: string) =>
  rows.filter((r) => r[key] === value).length;

describe('mock recruiters store', () => {
  it('holds 312 recruiters with unique ids counting down from REC10892 to REC10581', () => {
    expect(rows).toHaveLength(312);
    expect(new Set(rows.map((r) => r.recruiter_id)).size).toBe(312);
    expect(rows[0]?.recruiter_id).toBe('REC10892');
    expect(rows.at(-1)?.recruiter_id).toBe('REC10581');
  });

  it('serves the ten reference rows at the top of the store', () => {
    expect(
      rows
        .slice(0, 5)
        .map((r) => [
          r.recruiter_id,
          r.business_name,
          r.owner_name,
          r.status,
          r.verification,
          r.last_login_at
        ])
    ).toEqual([
      [
        'REC10892',
        'Spice Bowl Restaurant',
        'Rajesh Kumar',
        'active',
        'verified',
        '2024-06-24T10:24:00+05:30'
      ],
      ['REC10891', 'Urban Bites', 'Priya Nair', 'active', 'verified', '2024-06-22T09:18:00+05:30'],
      [
        'REC10890',
        'The Food Court',
        'Amit Verma',
        'active',
        'pending',
        '2024-06-20T16:52:00+05:30'
      ],
      [
        'REC10889',
        'Tasty Point',
        'Suresh Goud',
        'inactive',
        'verified',
        '2024-06-18T11:03:00+05:30'
      ],
      ['REC10888', 'Meal Hub', 'Neha Kulkarni', 'pending', 'pending', '2024-06-16T09:20:00+05:30']
    ]);
  });

  it('gives every reference row an owner, a valid phone and an e-mail', () => {
    for (const row of rows.slice(0, 5)) {
      expect(row.owner_name).not.toBe('');
      expect(row.phone).toMatch(/^[6-9]\d{9}$/);
      expect(row.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    }
  });

  it('has exactly 286 active, 12 inactive, 8 pending and 6 suspended recruiters', () => {
    expect(count('status', 'active')).toBe(286);
    expect(count('status', 'inactive')).toBe(12);
    expect(count('status', 'pending')).toBe(8);
    expect(count('status', 'suspended')).toBe(6);
    expect(rows.every((r) => RECRUITER_STATUSES.includes(r.status))).toBe(true);
  });

  it('adds up to exactly 642 outlets and 1,428 open jobs, with at least one outlet each', () => {
    expect(rows.reduce((sum, r) => sum + r.outlets, 0)).toBe(642);
    expect(rows.reduce((sum, r) => sum + r.open_jobs, 0)).toBe(1428);
    expect(rows.every((r) => r.outlets >= 1)).toBe(true);
    expect(rows.every((r) => r.open_jobs >= 0 && r.applications >= 0)).toBe(true);
  });

  it('splits the business types about 45, 35 and 20 percent', () => {
    expect(count('business_type', 'Restaurant')).toBe(140);
    expect(count('business_type', 'Cloud Kitchen')).toBe(109);
    expect(count('business_type', 'Food Court')).toBe(63);
    expect(rows.every((r) => BUSINESS_TYPES.includes(r.business_type))).toBe(true);
  });

  it('has unique business names and every phone and e-mail valid', () => {
    expect(new Set(rows.map((r) => r.business_name)).size).toBe(312);
    expect(rows.every((r) => /^[6-9]\d{9}$/.test(r.phone))).toBe(true);
    expect(rows.every((r) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email))).toBe(true);
  });

  it('is mostly Hyderabad, with neighbourhoods and the other cities present', () => {
    const cities = new Set(rows.map((r) => r.city));

    expect(count('city', 'Hyderabad')).toBeGreaterThan(156);
    for (const city of ['Secunderabad', 'Warangal', 'Vijayawada', 'Visakhapatnam', 'Bengaluru']) {
      expect(cities.has(city)).toBe(true);
    }
    expect(rows.every((r) => r.area !== '')).toBe(true);
  });

  it('has joined dates that strictly decrease, 12 to 36 hours apart after the reference rows', () => {
    for (let i = 1; i < rows.length; i++) {
      const gap = Date.parse(rows[i - 1]!.joined_at) - Date.parse(rows[i]!.joined_at);
      expect(gap).toBeGreaterThan(0);
      if (i >= 10) {
        expect(gap).toBeGreaterThanOrEqual(12 * 3_600_000);
        expect(gap).toBeLessThanOrEqual(36 * 3_600_000);
      }
    }
  });

  it('builds the same recruiters on every start', () => {
    expect(buildRecruiters()).toEqual(buildRecruiters());
    expect(buildRecruiters()).toEqual(rows);
  });
});

describe('recruiter store changes', () => {
  it('moves the summary by exactly one when a status changes', () => {
    const before = recruitersSummary(getRecruitersStore());
    updateRecruiter('REC10892', { status: 'inactive' });
    const after = recruitersSummary(getRecruitersStore());

    expect(after.active).toBe(before.active - 1);
    expect(after.inactive).toBe(before.inactive + 1);
    expect(after.total).toBe(before.total);
    updateRecruiter('REC10892', { status: 'active' });
    expect(recruitersSummary(getRecruitersStore())).toEqual(before);
  });

  it('adds a recruiter one id above the highest, under review, joined at the mock clock', () => {
    const highest = getRecruitersStore().reduce(
      (max, r) => Math.max(max, Number(r.recruiter_id.slice(3))),
      0
    );
    const row = addRecruiter({
      business_name: 'Test Kitchen',
      business_type: 'Cloud Kitchen',
      area: 'Madhapur',
      city: 'Hyderabad',
      owner_name: 'Test Owner',
      phone: '9000000001',
      email: 'owner@test.example.com'
    });

    expect(row).toMatchObject({
      recruiter_id: `REC${String(highest + 1).padStart(5, '0')}`,
      status: 'pending',
      verification: 'pending',
      joined_at: '2024-06-24T18:00:00+05:30',
      last_login_at: null
    });
    expect(findRecruiter(row.recruiter_id)).toEqual(row);
  });

  it('answers undefined for an unknown id', () => {
    expect(findRecruiter('REC00001')).toBeUndefined();
    expect(updateRecruiter('REC00001', { status: 'active' })).toBeUndefined();
  });
});
