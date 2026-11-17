import { REPORTS_OVERVIEW } from './reportsTestData';
import {
  TAG_DOT_CLEAR,
  formatTrendDate,
  spreadTags,
  tagWidth,
  trendAriaLabel,
  trendAxis,
  trendRightMargin,
  trendSummary
} from './reportsTrend';

const POINTS = REPORTS_OVERVIEW.hiring_trend;
const LAST = { date: '2026-06-24', applications: 1842, jobs: 312, hires: 124 };

describe('formatTrendDate', () => {
  it('writes the day and the short month', () => {
    expect(formatTrendDate('2026-05-26')).toBe('26 May');
    expect(formatTrendDate('2026-06-03')).toBe('3 Jun');
  });

  it('reads the day from the text, so the first of the year stays the first', () => {
    expect(formatTrendDate('2026-01-01')).toBe('1 Jan');
  });

  it('gives back text that is not a date', () => {
    expect(formatTrendDate('soon')).toBe('soon');
  });
});

describe('trendSummary', () => {
  it('reads a sample as a sentence', () => {
    expect(trendSummary({ date: '2026-05-26', applications: 469, jobs: 81, hires: 14 })).toBe(
      '26 May: 469 applications, 81 jobs, 14 hires'
    );
  });

  it('groups thousands and uses the singular for one', () => {
    expect(trendSummary(LAST)).toBe('24 Jun: 1,842 applications, 312 jobs, 124 hires');
    expect(trendSummary({ date: '2026-06-03', applications: 1, jobs: 1, hires: 1 })).toBe(
      '3 Jun: 1 application, 1 job, 1 hire'
    );
  });
});

describe('trendAriaLabel', () => {
  it('names the first and the last day', () => {
    expect(trendAriaLabel(POINTS)).toBe(
      'Hiring trend from 26 May to 24 Jun: applications, jobs and hires'
    );
  });

  it('still has a name with no samples', () => {
    expect(trendAriaLabel([])).toBe('Hiring trend');
  });
});

describe('trendAxis', () => {
  it('rounds the highest value up to four even steps from zero', () => {
    expect(trendAxis(POINTS)).toEqual({ max: 2000, ticks: [0, 500, 1000, 1500, 2000] });
  });

  it('counts every series, not only applications', () => {
    const axis = trendAxis([{ date: '2026-06-01', applications: 10, jobs: 900, hires: 5 }]);

    expect(axis).toEqual({ max: 1000, ticks: [0, 250, 500, 750, 1000] });
  });

  it('still draws an axis when there is nothing to show', () => {
    expect(trendAxis([])).toEqual({ max: 4, ticks: [0, 1, 2, 3, 4] });
  });
});

describe('tag sizes', () => {
  it('makes a tag wider for more digits', () => {
    expect(tagWidth('1,842')).toBeGreaterThan(tagWidth('124'));
    expect(tagWidth('124')).toBeGreaterThan(tagWidth('12'));
  });

  it('keeps room on the right for the tag that sits beside its dot', () => {
    expect(trendRightMargin(LAST)).toBeGreaterThanOrEqual(TAG_DOT_CLEAR + tagWidth('124'));
    expect(trendRightMargin({ ...LAST, hires: 1240 })).toBeGreaterThan(trendRightMargin(LAST));
  });
});

describe('spreadTags', () => {
  it('leaves tags where they want to be when they fit', () => {
    expect(spreadTags([0, 40, 80], 25, 2, 0, 200)).toEqual([0, 40, 80]);
  });

  it('pushes a tag down when it would cover the one above it', () => {
    expect(spreadTags([0, 10], 25, 2, 0, 200)).toEqual([0, 27]);
  });

  it('moves the tags above up when the last one has to stay above the bottom limit', () => {
    expect(spreadTags([100, 129.5], 25, 2, 0, 153)).toEqual([100, 128]);
    expect(spreadTags([110, 129.5], 25, 2, 0, 153)).toEqual([101, 128]);
  });

  it('never lifts a tag above the top limit', () => {
    expect(spreadTags([-9], 25, 2, 0, 200)).toEqual([0]);
  });

  it('answers in the order it was asked, not from the top down', () => {
    expect(spreadTags([90, 10], 25, 2, 0, 300)).toEqual([90, 10]);
  });
});
