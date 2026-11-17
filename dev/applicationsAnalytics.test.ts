import { describe, expect, it } from 'vitest';
import { applicationOptions, applicationsTrend } from './applicationsAnalytics.ts';

describe('applications trend', () => {
  it('gives seven points for every range', () => {
    for (const range of ['7d', '30d', '90d']) expect(applicationsTrend(range)).toHaveLength(7);
    expect(applicationsTrend('nonsense')).toEqual(applicationsTrend('30d'));
  });

  it('ends the 30-day curve on 24 Jun with 1,460, in 5-day periods', () => {
    const trend = applicationsTrend('30d');

    expect(trend.map((p) => p.date)).toEqual([
      '2026-05-25',
      '2026-05-30',
      '2026-06-04',
      '2026-06-09',
      '2026-06-14',
      '2026-06-19',
      '2026-06-24'
    ]);
    expect(trend[0]?.count).toBe(250);
    expect(trend.at(-1)?.count).toBe(1460);
  });

  it('draws the 7-day chart from the same days: five days of 292 at the end', () => {
    const trend = applicationsTrend('7d');

    expect(trend.map((p) => p.date)).toEqual([
      '2026-06-18',
      '2026-06-19',
      '2026-06-20',
      '2026-06-21',
      '2026-06-22',
      '2026-06-23',
      '2026-06-24'
    ]);
    expect(trend.slice(2).map((p) => p.count)).toEqual([292, 292, 292, 292, 292]);
    expect(trend.slice(2).reduce((sum, p) => sum + p.count, 0)).toBe(
      applicationsTrend('30d').at(-1)?.count
    );
    expect(trend.slice(0, 2).map((p) => p.count)).toEqual([235, 232]);
  });

  it('cuts the 90-day chart into 15-day periods that sum to no more than the 8,672 applications', () => {
    const trend = applicationsTrend('90d');
    const last30d = applicationsTrend('30d');

    expect(trend.map((p) => p.date)).toEqual([
      '2026-03-26',
      '2026-04-10',
      '2026-04-25',
      '2026-05-10',
      '2026-05-25',
      '2026-06-09',
      '2026-06-24'
    ]);
    expect(trend.reduce((sum, p) => sum + p.count, 0)).toBeLessThanOrEqual(8672);
    expect(trend.at(-1)?.count).toBe(last30d.slice(4).reduce((sum, p) => sum + p.count, 0));
    expect(trend.slice(0, 4).every((p) => p.count >= 40 * 15 && p.count <= 60 * 15)).toBe(true);
  });
});

describe('applications filter options', () => {
  it('labels each job with its outlet and id, each recruiter with their id, and sorts by label', () => {
    const jobs = applicationOptions('jobs', '');
    const recruiters = applicationOptions('recruiters', '');

    expect(jobs).toHaveLength(20);
    expect(jobs.map((o) => o.label)).toEqual(
      [...jobs.map((o) => o.label)].sort((a, b) => a.localeCompare(b, 'en'))
    );
    expect(applicationOptions('jobs', 'spice bowl')).toContainEqual({
      value: 'JOB10293',
      label: 'Cook / Chef (Spice Bowl Restaurant) · JOB10293'
    });
    expect(applicationOptions('recruiters', 'rahul verma')).toContainEqual({
      value: 'REC001',
      label: 'Rahul Verma (REC001)'
    });
    expect(recruiters).toHaveLength(20);
  });

  it('lists each city once with its name as the value, and searches inside the label', () => {
    const cities = applicationOptions('locations', '');

    expect(cities.map((o) => o.value)).toEqual(cities.map((o) => o.label));
    expect(cities.map((o) => o.label)).toEqual([
      'Bangalore',
      'Chennai',
      'Hyderabad',
      'Secunderabad'
    ]);
    expect(applicationOptions('locations', 'ABAD').map((o) => o.label)).toEqual([
      'Hyderabad',
      'Secunderabad'
    ]);
  });
});
