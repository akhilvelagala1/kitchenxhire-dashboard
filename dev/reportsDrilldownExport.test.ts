import { describe, expect, it } from 'vitest';
import { reportsHiredRows, reportsRejectedRows } from './reportsDrilldownLedger.ts';
import { REJECTION_REASONS } from './reportsDrilldownMockData.ts';
import { LISTS, get } from './reportsDrilldownTestKit.ts';
import { readReportsExportDetail, reportsDetailCsv } from './reportsExport.ts';
import { REPORT_RANGES, reportsOverview, type ReportRange } from './reportsMockData.ts';

const alphabetical = (values: readonly string[]) => [...values].sort((a, b) => a.localeCompare(b));

describe('time to hire', () => {
  it.each(REPORT_RANGES)(
    'is the card of %s: its average, its change and the hires of the Hired list',
    (range) => {
      const { kpis, range: window } = reportsOverview(range);
      const { json } = get('time-to-hire', { range });

      expect(json.data.range).toEqual(window);
      expect(json.data.average_days).toBe(kpis.avg_time_to_hire_days.value);
      expect(json.data.change_pct).toBe(kpis.avg_time_to_hire_days.change_pct);
      expect(json.data.hires_counted).toBe(kpis.hired.value);
      expect(json.data.hires_counted).toBe(get('hired', { range }).json.meta.total);
    }
  );

  it.each(REPORT_RANGES)(
    'runs its %s trend on the dates of the Hiring Trend and ends on the average',
    (range) => {
      const { hiring_trend: samples } = reportsOverview(range);
      const { average_days: average, trend } = get('time-to-hire', { range }).json.data;

      expect(trend.map((p: { date: string }) => p.date)).toEqual(samples.map((p) => p.date));
      expect(trend.at(-1).average_days).toBe(average);
    }
  );

  it.each(REPORT_RANGES)('is a possible running average over the hires of %s', (range) => {
    const { hiring_trend: samples } = reportsOverview(range);
    const { trend } = get('time-to-hire', { range }).json.data;
    let hires = 0;
    let days = 0;
    const means = samples.map((sample, i) => {
      const total = trend[i].average_days * (hires + sample.hires);
      const mean = (total - days) / sample.hires;
      hires += sample.hires;
      days = total;
      return mean;
    });

    expect(means.every((mean) => mean > 0)).toBe(true);
  });

  it('has the five categories of the reference picture, most hires first, and no Others', () => {
    const { by_category: categories } = get('time-to-hire').json.data;
    const hires: number[] = categories.map((c: { hires: number }) => c.hires);

    expect(categories.map((c: { label: string }) => c.label)).toEqual([
      'Cook / Chef',
      'Kitchen Helper',
      'Cleaning & Stewarding',
      'Delivery & Store Support',
      'Bakery Assistant'
    ]);
    expect(categories.map((c: { average_days: number }) => c.average_days)).toEqual([
      5.2, 6.1, 7.4, 8.1, 9
    ]);
    expect(hires).toEqual([...hires].sort((a, b) => b - a));
    expect(hires.every((h) => Number.isInteger(h) && h > 0)).toBe(true);
  });

  it('scales the days of the categories to the average of the other windows', () => {
    const days = (range: ReportRange) =>
      get('time-to-hire', { range }).json.data.by_category.map(
        (c: { average_days: number }) => c.average_days
      );

    expect(days('7d')).toEqual([5, 5.8, 7.1, 7.7, 8.6]);
    expect(days('90d')).toEqual([5.7, 6.6, 8.1, 8.8, 9.8]);
  });
});

describe('the filter choices', () => {
  it('are sorted A to Z, without repeats and without "Not recorded"', () => {
    const { data } = get('filter-options').json;

    for (const choices of Object.values<string[]>(data)) {
      expect(choices).toEqual(alphabetical([...new Set(choices)]));
    }
    expect(data.job_categories).toEqual([
      'Bakery Assistant',
      'Cleaning & Stewarding',
      'Cook / Chef',
      'Delivery & Store Support',
      'Kitchen Helper',
      'Others',
      'Restaurant Manager'
    ]);
    expect(data.rejection_reasons).toEqual(alphabetical(REJECTION_REASONS));
    expect(data.outlets).toEqual(
      alphabetical([...new Set(reportsHiredRows('90d').map((row) => row.outlet_name))])
    );
  });
});

describe('the export of a stat card', () => {
  const lines = (csv: string) => csv.trimEnd().split('\n');
  const HEADINGS = {
    jobs_posted: '#,Job Title,Posted By (Recruiter),Outlet / Restaurant,Posted On,Applications',
    applications: '#,Applicant,Applied For,Outlet / Restaurant,Applied On,Status',
    hired: '#,Candidate,Hired For,Recruited By,Outlet / Restaurant,Hired On',
    rejected: '#,Applicant,Applied For,Outlet / Restaurant,Rejected On,Reason'
  } as const;

  it.each(LISTS)(
    'holds a heading row and every row of the $path card, newest first, not one page',
    ({ path, kpi }) => {
      const rows = lines(reportsDetailCsv('30d', { metric: kpi, search: '', filter: '' }));
      const newest = get(path).json.data[0];

      expect(rows[0]).toBe(HEADINGS[kpi]);
      expect(rows).toHaveLength(reportsOverview('30d').kpis[kpi].value + 1);
      expect(rows.every((row) => row.split(',').length === 6)).toBe(true);
      expect(rows[1].split(',')[0]).toBe(
        newest.job_id ?? newest.candidate_id ?? newest.application_id
      );
    }
  );

  it('keeps only what the search and the filter of the list keep', () => {
    const outlet = reportsHiredRows('30d')[0].outlet_name;
    const csv = lines(reportsDetailCsv('30d', { metric: 'hired', search: 'ra', filter: outlet }));

    expect(csv).toHaveLength(get('hired', { search: 'ra', outlet }).json.meta.total + 1);
    expect(csv.length).toBeLessThan(591);
    expect(csv.slice(1).every((row) => row.includes(outlet))).toBe(true);
  });

  it('writes the status of an application as the screen names it', () => {
    const csv = lines(
      reportsDetailCsv('30d', { metric: 'applications', search: '', filter: 'hired' })
    );

    expect(csv).toHaveLength(591);
    expect(csv.slice(1).every((row) => row.endsWith(',Hired'))).toBe(true);
  });

  it('writes "Not recorded" for a rejection that has no reason', () => {
    const csv = lines(reportsDetailCsv('30d', { metric: 'rejected', search: '', filter: '' }));
    const none = reportsRejectedRows('30d').filter((row) => row.rejection_reason === null).length;

    expect(none).toBeGreaterThan(0);
    expect(csv.filter((row) => row.endsWith(',Not recorded'))).toHaveLength(none);
  });

  it('writes the time to hire as sections, and ignores a search or a filter', () => {
    const metric = 'avg_time_to_hire_days';
    const csv = lines(reportsDetailCsv('30d', { metric, search: 'x', filter: 'y' }));
    const sections = [...new Set(csv.slice(1).map((row) => row.split(',')[0]))];

    expect(csv[0]).toBe('section,label,metric,value');
    expect(sections).toEqual(['Range', 'Time to Hire', 'Trend', 'By Category']);
    expect(csv).toContain('Time to Hire,Avg. Time to Hire (days),average_days,6.8');
    expect(csv).toContain('Time to Hire,Avg. Time to Hire (days),hires_counted,590');
    expect(csv).toContain('By Category,Cook / Chef,average_days,5.2');
    expect(csv.filter((row) => row.startsWith('Trend,'))).toHaveLength(8);
    expect(reportsDetailCsv('30d', { metric, search: 'x', filter: 'y' })).toBe(
      reportsDetailCsv('30d', { metric, search: '', filter: '' })
    );
  });

  it('reads the card a body names, and leaves a body with none to the Overview', () => {
    expect(readReportsExportDetail({ range: '30d' })).toEqual({ fields: {} });
    expect(
      readReportsExportDetail({ metric: 'hired', search: 'ravi', filter: 'Meal Hub' })
    ).toEqual({ detail: { metric: 'hired', search: 'ravi', filter: 'Meal Hub' }, fields: {} });
  });

  it('refuses a card that does not exist and a status that is none, naming the field', () => {
    const fieldsOf = (body: Record<string, unknown>) =>
      Object.keys(readReportsExportDetail(body).fields);

    expect(fieldsOf({ metric: 'bogus' })).toEqual(['metric']);
    expect(fieldsOf({ metric: null })).toEqual(['metric']);
    expect(fieldsOf({ metric: 'applications', filter: 'maybe' })).toEqual(['filter']);
    expect(fieldsOf({ metric: 'hired', filter: 'maybe' })).toEqual([]);
  });
});
