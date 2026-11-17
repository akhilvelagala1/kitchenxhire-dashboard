import { describe, expect, it } from 'vitest';
import {
  buildJobSeekers,
  createJobSeeker,
  findJobSeeker,
  getJobSeekersStore,
  updateJobSeeker
} from './jobSeekersMockData.ts';

const rows = buildJobSeekers();
const count = (test: Parameters<typeof rows.filter>[0]) => rows.filter(test).length;

describe('job seeker mock store', () => {
  it('has 12,846 job seekers with ids counting down from JS12846 to JS00001', () => {
    expect(rows).toHaveLength(12846);
    expect(rows[0]?.job_seeker_id).toBe('JS12846');
    expect(rows.at(-1)?.job_seeker_id).toBe('JS00001');
    expect(new Set(rows.map((r) => r.job_seeker_id)).size).toBe(12846);
  });

  it('keeps the exact status quotas, application sum and shortlisted and hired counts', () => {
    expect(count((r) => r.status === 'active')).toBe(10982);
    expect(count((r) => r.status !== 'active')).toBe(1864);
    expect(count((r) => r.status === 'inactive')).toBe(1460);
    expect(count((r) => r.status === 'under_review')).toBe(240);
    expect(count((r) => r.status === 'suspended')).toBe(164);
    expect(rows.reduce((sum, r) => sum + r.applications_count, 0)).toBe(28642);
    expect(count((r) => r.shortlisted_count > 0)).toBe(4286);
    expect(count((r) => r.hired_count > 0)).toBe(1842);
  });

  it('always has hired at most shortlisted at most applications, and experience 0 to 12', () => {
    for (const r of rows) {
      expect(r.hired_count).toBeLessThanOrEqual(r.shortlisted_count);
      expect(r.shortlisted_count).toBeLessThanOrEqual(r.applications_count);
      expect(r.experience_years).toBeGreaterThanOrEqual(0);
      expect(r.experience_years).toBeLessThanOrEqual(12);
      expect(Number.isInteger(r.experience_years)).toBe(true);
      expect(r.profile_completion).toBeGreaterThanOrEqual(0);
      expect(r.profile_completion).toBeLessThanOrEqual(100);
    }
  });

  it('has the ten reference rows first, as in the picture', () => {
    expect(
      rows
        .slice(0, 10)
        .map((r) => [
          r.job_seeker_id,
          r.name,
          r.city,
          r.profile_completion,
          r.applications_count,
          r.interviews_count,
          r.status,
          r.last_active_at
        ])
    ).toEqual([
      ['JS12846', 'Ramesh Kumar', 'Hyderabad', 92, 12, 4, 'active', '2024-06-24T10:24:00+05:30'],
      ['JS12845', 'Priya Sharma', 'Banjara Hills', 88, 8, 3, 'active', '2024-06-22T09:18:00+05:30'],
      ['JS12844', 'Arjun Reddy', 'Secunderabad', 76, 6, 2, 'active', '2024-06-20T09:18:00+05:30'],
      ['JS12843', 'Sangeetha Devi', 'Madhapur', 64, 5, 1, 'inactive', '2024-06-18T11:03:00+05:30'],
      ['JS12842', 'Venkatesh Rao', 'Gachibowli', 95, 4, 2, 'active', '2024-06-16T09:20:00+05:30'],
      ['JS12841', 'Neha Jain', 'Kukatpally', 70, 4, 1, 'active', '2024-06-15T17:47:00+05:30'],
      [
        'JS12840',
        'Karthik Reddy',
        'Jubilee Hills',
        82,
        3,
        1,
        'active',
        '2024-06-14T14:30:00+05:30'
      ],
      ['JS12839', 'Megha Singh', 'Begumpet', 58, 3, 0, 'under_review', '2024-06-13T11:12:00+05:30'],
      ['JS12838', 'Deepak Verma', 'LB Nagar', 90, 2, 1, 'active', '2024-06-12T18:37:00+05:30'],
      ['JS12837', 'Lakshmi Priya', 'Uppal', 68, 2, 0, 'suspended', '2024-06-11T10:46:00+05:30']
    ]);
  });

  it('makes last_active_at decrease after the fixed rows, stepping back 10 to 90 minutes', () => {
    for (let i = 10; i < 200; i++) {
      const prev = rows[i - 1]!.last_active_at;
      const curr = rows[i]!.last_active_at;
      expect(prev).not.toBeNull();
      expect(curr).not.toBeNull();
      const minutes = (Date.parse(prev!) - Date.parse(curr!)) / 60_000;
      expect(minutes).toBeGreaterThanOrEqual(10);
      expect(minutes).toBeLessThanOrEqual(90);
    }
  });

  it('makes valid generated people: example.com e-mails, phones from 6 to 9, known cities', () => {
    const generated = rows.slice(10);

    expect(generated.every((r) => r.email.endsWith('@example.com'))).toBe(true);
    expect(generated.every((r) => /^[6-9]\d{9}$/.test(r.phone))).toBe(true);
    expect(rows.every((r) => /^[6-9]\d{9}$/.test(r.phone))).toBe(true);
    expect(count((r) => r.city === 'Hyderabad')).toBeGreaterThan(rows.length / 3);
  });

  it('builds the same store twice', () => {
    expect(buildJobSeekers()).toEqual(rows);
  });

  it('finds, updates and creates rows in the shared store', () => {
    expect(getJobSeekersStore()).toHaveLength(12846);
    expect(findJobSeeker('JS12846')?.name).toBe('Ramesh Kumar');
    expect(findJobSeeker('JS99999')).toBeUndefined();
    expect(updateJobSeeker('JS12846', { status: 'inactive' })?.status).toBe('inactive');
    expect(updateJobSeeker('JS99999', { status: 'inactive' })).toBeUndefined();

    const created = createJobSeeker({
      name: 'Test Person',
      email: 'test.person@example.com',
      phone: '9000000000',
      city: 'Chennai',
      preferred_job_title: 'Barista',
      experience_years: 2
    });

    expect(created).toMatchObject({
      job_seeker_id: 'JS12847',
      status: 'active',
      applications_count: 0,
      interviews_count: 0,
      profile_completion: 20,
      state: 'TN',
      joined_at: '2024-06-24T18:00:00+05:30',
      last_active_at: '2024-06-24T18:00:00+05:30'
    });
    expect(getJobSeekersStore()[0]).toEqual(created);
    expect(findJobSeeker('JS12847')).toEqual(created);
    expect(findJobSeeker('JS12846')?.name).toBe('Ramesh Kumar');
  });
});
