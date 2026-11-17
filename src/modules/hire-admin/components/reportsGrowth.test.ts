import { describeGrowth, formatAxisThousands, growthAxes, monthLabel } from './reportsGrowth';
import { REPORTS_OVERVIEW } from './reportsTestData';

describe('monthLabel', () => {
  it('names the month from a YYYY-MM string', () => {
    expect(monthLabel('2026-01')).toBe('Jan');
    expect(monthLabel('2026-06')).toBe('Jun');
    expect(monthLabel('2026-12')).toBe('Dec');
  });

  it('returns text that is not a month as it came', () => {
    expect(monthLabel('soon')).toBe('soon');
  });
});

describe('formatAxisThousands', () => {
  it.each([
    [0, '0'],
    [750, '750'],
    [5000, '5K'],
    [2500, '2.5K'],
    [25000, '25K'],
    [1500000, '1.5M']
  ])('writes %d as %s', (value, text) => {
    expect(formatAxisThousands(value)).toBe(text);
  });
});

describe('growthAxes', () => {
  it('gives each series an axis of five steps that reaches its largest value', () => {
    const { seekers, recruiters } = growthAxes(REPORTS_OVERVIEW.platform_growth);

    expect(seekers).toEqual({ max: 25000, ticks: [0, 5000, 10000, 15000, 20000, 25000] });
    expect(recruiters).toEqual({ max: 500, ticks: [0, 100, 200, 300, 400, 500] });
  });

  it('still draws 0 to 5 when there is nothing to show', () => {
    const { seekers, recruiters } = growthAxes([]);

    expect(seekers.ticks).toEqual([0, 1, 2, 3, 4, 5]);
    expect(recruiters.ticks).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('never steps by a fraction, because these are head counts', () => {
    const { recruiters } = growthAxes([{ month: '2026-06', job_seekers: 40, recruiters: 12 }]);

    expect(recruiters.ticks).toEqual([0, 3, 6, 9, 12, 15]);
  });
});

describe('describeGrowth', () => {
  it('reads out one month with grouped digits', () => {
    expect(describeGrowth(REPORTS_OVERVIEW.platform_growth[0]!)).toBe(
      'Jan: 9,800 job seekers, 120 recruiters'
    );
  });

  it('uses the singular for a count of one', () => {
    expect(describeGrowth({ month: '2026-02', job_seekers: 1, recruiters: 1 })).toBe(
      'Feb: 1 job seeker, 1 recruiter'
    );
  });
});
