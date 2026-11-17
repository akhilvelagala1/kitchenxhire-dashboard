import { describe, expect, it } from 'vitest';
import { csvField, reportsCsv } from './reportsExport.ts';
import {
  REPORT_RANGES,
  parseReportsRange,
  reportsOverview,
  type ReportRange
} from './reportsMockData.ts';

const DAY_MS = 24 * 60 * 60_000;
const daysBetween = (from: string, to: string) => (Date.parse(to) - Date.parse(from)) / DAY_MS;
const sum = (values: readonly number[]) => values.reduce((a, b) => a + b, 0);

/** The days between neighbouring trend samples of a window. */
const gaps = (range: ReportRange) => {
  const dates = reportsOverview(range).hiring_trend.map((point) => point.date);
  return dates.slice(1).map((date, i) => daysBetween(dates[i]!, date));
};

const WINDOWS: [ReportRange, string, number, number[], number][] = [
  ['7d', '2026-06-18', 7, [9, 14, 11, -3, -12], 6.5],
  ['30d', '2026-05-26', 30, [12, 18, 15, -5, -22], 6.8],
  ['90d', '2026-03-27', 90, [21, 26, 19, -8, -17], 7.4]
];

describe('reports mock data', () => {
  it('serves the 30-day window of the reference picture exactly', () => {
    const overview = reportsOverview('30d');

    expect(overview.range).toEqual({ from: '2026-05-26', to: '2026-06-24' });
    expect(overview.kpis).toEqual({
      jobs_posted: { value: 1482, change_pct: 12 },
      applications: { value: 8672, change_pct: 18 },
      hired: { value: 590, change_pct: 15 },
      rejected: { value: 1036, change_pct: -5 },
      avg_time_to_hire_days: { value: 6.8, change_pct: -22 }
    });
    expect(overview.hiring_trend.map((p) => p.date)).toEqual([
      '2026-05-26',
      '2026-05-30',
      '2026-06-03',
      '2026-06-07',
      '2026-06-11',
      '2026-06-15',
      '2026-06-19',
      '2026-06-24'
    ]);
    expect(overview.hiring_trend.map((p) => p.applications)).toEqual([
      469, 816, 1050, 891, 1125, 1238, 1241, 1842
    ]);
    expect(overview.hiring_trend.map((p) => p.jobs)).toEqual([
      81, 142, 150, 166, 212, 188, 231, 312
    ]);
    expect(overview.hiring_trend.map((p) => p.hires)).toEqual([14, 42, 74, 70, 88, 81, 97, 124]);
    expect(overview.application_status).toEqual([
      { status: 'hired', count: 590 },
      { status: 'shortlisted', count: 4960 },
      { status: 'under_review', count: 2086 },
      { status: 'rejected', count: 1036 }
    ]);
    expect(overview.top_categories).toEqual([
      { label: 'Cook / Chef', count: 428 },
      { label: 'Kitchen Helper', count: 276 },
      { label: 'Cleaning & Stewarding', count: 198 },
      { label: 'Delivery & Store Support', count: 142 },
      { label: 'Bakery Assistant', count: 118 },
      { label: 'Others', count: 86 }
    ]);
    expect(overview.top_locations).toEqual([
      { label: 'Hyderabad', count: 3248 },
      { label: 'Madhapur', count: 1286 },
      { label: 'Gachibowli', count: 982 },
      { label: 'Banjara Hills', count: 768 },
      { label: 'Kondapur', count: 646 }
    ]);
    expect(overview.platform_growth.map((m) => [m.month, m.job_seekers, m.recruiters])).toEqual([
      ['2026-01', 9800, 120],
      ['2026-02', 12300, 150],
      ['2026-03', 15200, 190],
      ['2026-04', 17200, 230],
      ['2026-05', 20700, 270],
      ['2026-06', 24860, 312]
    ]);
  });

  it.each(WINDOWS)('counts %s back from 24 Jun 2026 from %s', (range, from, days, changes, avg) => {
    const { range: window, kpis } = reportsOverview(range);

    expect(window).toEqual({ from, to: '2026-06-24' });
    expect(daysBetween(window.from, window.to) + 1).toBe(days);
    expect(Object.values(kpis).map((kpi) => kpi.change_pct)).toEqual(changes);
    expect(kpis.avg_time_to_hire_days.value).toBe(avg);
  });

  it('samples the trend daily for 7d, every 4 or 5 days for 30d and every 15 days for 90d', () => {
    expect(gaps('7d')).toEqual([1, 1, 1, 1, 1, 1]);
    expect(gaps('30d')).toEqual([4, 4, 4, 4, 4, 4, 5]);
    expect(gaps('90d')).toEqual([15, 15, 15, 15, 15]);
    expect(reportsOverview('90d').hiring_trend.map((p) => p.date)).toEqual([
      '2026-04-10',
      '2026-04-25',
      '2026-05-10',
      '2026-05-25',
      '2026-06-09',
      '2026-06-24'
    ]);
    expect(reportsOverview('7d').hiring_trend.map((p) => p.date)[0]).toBe('2026-06-18');
  });

  it('keeps the last two 90-day samples equal to the 30-day totals, as both windows end today', () => {
    const last = reportsOverview('90d').hiring_trend.slice(-2);
    const { kpis } = reportsOverview('30d');

    expect(sum(last.map((p) => p.applications))).toBe(kpis.applications.value);
    expect(sum(last.map((p) => p.jobs))).toBe(kpis.jobs_posted.value);
    expect(sum(last.map((p) => p.hires))).toBe(kpis.hired.value);
  });

  it('shows the same six months of platform growth for every window, rising each month', () => {
    const growth = reportsOverview('30d').platform_growth;

    expect(growth).toHaveLength(6);
    expect(reportsOverview('7d').platform_growth).toEqual(growth);
    expect(reportsOverview('90d').platform_growth).toEqual(growth);
    growth.slice(1).forEach((point, i) => {
      expect(point.job_seekers).toBeGreaterThan(growth[i]!.job_seekers);
      expect(point.recruiters).toBeGreaterThan(growth[i]!.recruiters);
    });
  });

  it('reads a range from a request: 30d when none, nothing for one the API does not have', () => {
    expect(parseReportsRange('7d')).toBe('7d');
    expect(parseReportsRange('90d')).toBe('90d');
    expect(parseReportsRange(undefined)).toBe('30d');
    expect(parseReportsRange(null)).toBe('30d');
    for (const bad of ['', '14d', '30D', 30, {}]) expect(parseReportsRange(bad)).toBeUndefined();
  });
});

describe.each(REPORT_RANGES)('the %s window keeps the rules of the API', (range) => {
  const overview = reportsOverview(range);
  const { kpis, hiring_trend: trend } = overview;

  it('adds the trend samples up to the KPI totals and ends on the last day', () => {
    expect(sum(trend.map((p) => p.applications))).toBe(kpis.applications.value);
    expect(sum(trend.map((p) => p.jobs))).toBe(kpis.jobs_posted.value);
    expect(sum(trend.map((p) => p.hires))).toBe(kpis.hired.value);
    expect(trend.at(-1)!.date).toBe(overview.range.to);
    expect(trend[0]!.date >= overview.range.from).toBe(true);
  });

  it('adds the status slices up to the applications, with hired and rejected as in the KPIs', () => {
    const status = overview.application_status;

    expect(status.map((s) => s.status)).toEqual([
      'hired',
      'shortlisted',
      'under_review',
      'rejected'
    ]);
    expect(sum(status.map((s) => s.count))).toBe(kpis.applications.value);
    expect(status[0]!.count).toBe(kpis.hired.value);
    expect(status[3]!.count).toBe(kpis.rejected.value);
  });

  it('keeps categories within the jobs posted and locations within the applications, biggest first', () => {
    const rankings = [
      { rows: overview.top_categories, base: kpis.jobs_posted.value },
      { rows: overview.top_locations, base: kpis.applications.value }
    ];
    for (const { rows, base } of rankings) {
      const counts = rows.map((row) => row.count);
      expect(Math.max(...counts)).toBeLessThanOrEqual(base);
      expect(sum(counts)).toBeLessThanOrEqual(base);
      expect(Math.min(...counts)).toBeGreaterThan(0);
      expect(counts).toEqual([...counts].sort((a, b) => b - a));
    }
    expect(overview.top_categories).toHaveLength(6);
    expect(overview.top_locations).toHaveLength(5);
  });

  it('counts whole numbers only', () => {
    const counts = [
      ...Object.entries(kpis)
        .filter(([key]) => key !== 'avg_time_to_hire_days')
        .map(([, kpi]) => kpi.value),
      ...Object.values(kpis).map((kpi) => kpi.change_pct),
      ...trend.flatMap((p) => [p.applications, p.jobs, p.hires]),
      ...overview.application_status.map((s) => s.count),
      ...overview.top_categories.map((row) => row.count),
      ...overview.top_locations.map((row) => row.count),
      ...overview.platform_growth.flatMap((m) => [m.job_seekers, m.recruiters])
    ];

    expect(counts.every((count) => Number.isInteger(count))).toBe(true);
  });
});

/** The CSV as rows of cells. No label in the data has a comma or a quote, so a plain split is exact. */
const csvRows = (range: ReportRange) =>
  reportsCsv(range)
    .trimEnd()
    .split('\n')
    .map((line) => line.split(','));

const cell = (rows: string[][], section: string, label: string, metric: string) =>
  rows.find((r) => r[0] === section && r[1] === label && r[2] === metric)?.[3];

describe('reports CSV export', () => {
  it('starts with one header and lists the sections in the order of the screen', () => {
    const rows = csvRows('30d');

    expect(rows[0]).toEqual(['section', 'label', 'metric', 'value']);
    expect([...new Set(rows.slice(1).map((r) => r[0]))]).toEqual([
      'Range',
      'Key Metrics',
      'Hiring Trend',
      'Applications by Status',
      'Top Job Categories',
      'Top Locations',
      'Platform Growth'
    ]);
    expect(rows).toHaveLength(79);
    expect(rows.every((r) => r.length === 4)).toBe(true);
    expect(reportsCsv('30d').endsWith('\n')).toBe(true);
  });

  it('writes the numbers of the 30-day screen', () => {
    const rows = csvRows('30d');

    expect(cell(rows, 'Range', 'Last 30 Days', 'from')).toBe('2026-05-26');
    expect(cell(rows, 'Range', 'Last 30 Days', 'to')).toBe('2026-06-24');
    const kpis: [string, string, string][] = [
      ['Jobs Posted', '1482', '12'],
      ['Applications', '8672', '18'],
      ['Hired', '590', '15'],
      ['Rejected', '1036', '-5'],
      ['Avg. Time to Hire (days)', '6.8', '-22']
    ];
    for (const [label, value, change] of kpis) {
      expect(cell(rows, 'Key Metrics', label, 'value')).toBe(value);
      expect(cell(rows, 'Key Metrics', label, 'change_pct')).toBe(change);
    }
    expect(
      ['applications', 'jobs', 'hires'].map((m) => cell(rows, 'Hiring Trend', '2026-05-26', m))
    ).toEqual(['469', '81', '14']);
    expect(
      ['applications', 'jobs', 'hires'].map((m) => cell(rows, 'Hiring Trend', '2026-06-24', m))
    ).toEqual(['1842', '312', '124']);
    expect(cell(rows, 'Applications by Status', 'Under Review', 'count')).toBe('2086');
    expect(cell(rows, 'Top Job Categories', 'Cook / Chef', 'count')).toBe('428');
    expect(cell(rows, 'Top Locations', 'Hyderabad', 'count')).toBe('3248');
    expect(cell(rows, 'Platform Growth', '2026-06', 'job_seekers')).toBe('24860');
    expect(cell(rows, 'Platform Growth', '2026-06', 'recruiters')).toBe('312');
  });

  it('works the shares out of the counts as the screen does, with one decimal', () => {
    const rows = csvRows('30d');
    const shares = (section: string) =>
      rows.filter((r) => r[0] === section && r[2] === 'share_pct').map((r) => r[3]);

    expect(shares('Applications by Status')).toEqual(['6.8', '57.2', '24.1', '11.9']);
    expect(shares('Top Job Categories')).toEqual(['28.9', '18.6', '13.4', '9.6', '8.0', '5.8']);
    expect(shares('Top Locations')).toEqual(['37.5', '14.8', '11.3', '8.9', '7.4']);
  });

  it.each(REPORT_RANGES)(
    'writes the window and totals of %s, and the trend rows add up to them',
    (range) => {
      const rows = csvRows(range);
      const { kpis, range: window } = reportsOverview(range);
      const label = `Last ${range.slice(0, -1)} Days`;
      const total = (metric: string) =>
        sum(
          rows.filter((r) => r[0] === 'Hiring Trend' && r[2] === metric).map((r) => Number(r[3]))
        );

      expect(cell(rows, 'Range', label, 'from')).toBe(window.from);
      expect(cell(rows, 'Range', label, 'to')).toBe(window.to);
      expect(cell(rows, 'Key Metrics', 'Applications', 'value')).toBe(
        String(kpis.applications.value)
      );
      expect(total('applications')).toBe(kpis.applications.value);
      expect(total('jobs')).toBe(kpis.jobs_posted.value);
      expect(total('hires')).toBe(kpis.hired.value);
    }
  );

  it('wraps fields with a comma, a quote or a line break in quotes and doubles the quotes', () => {
    expect(csvField('Cook / Chef')).toBe('Cook / Chef');
    expect(csvField(1482)).toBe('1482');
    expect(csvField('Cook, Chef')).toBe('"Cook, Chef"');
    expect(csvField('The "best" cook')).toBe('"The ""best"" cook"');
    expect(csvField('two\nlines')).toBe('"two\nlines"');
  });
});
