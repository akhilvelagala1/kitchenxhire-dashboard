import { formatAxisDate, niceAxis, sparseTicks } from './jobsTrendScale';

describe('niceAxis', () => {
  it('rounds 428 up to a 0–500 axis with a gridline every 100', () => {
    expect(niceAxis(428)).toEqual({ top: 500, ticks: [0, 100, 200, 300, 400, 500] });
  });

  it('scales the axis down for a small period instead of leaving a flat line', () => {
    expect(niceAxis(109)).toEqual({ top: 150, ticks: [0, 50, 100, 150] });
  });

  it('keeps whole-number steps for tiny counts', () => {
    expect(niceAxis(3)).toEqual({ top: 3, ticks: [0, 1, 2, 3] });
  });

  it('still draws an axis when nothing was posted', () => {
    expect(niceAxis(0).ticks[0]).toBe(0);
    expect(niceAxis(0).top).toBeGreaterThan(0);
  });
});

describe('sparseTicks', () => {
  const days = (n: number) =>
    Array.from({ length: n }, (_, i) => `2026-06-${String(i + 1).padStart(2, '0')}`);

  it('labels every fifth day of a 31-day period, counted back from the last day', () => {
    const ticks = sparseTicks(days(31));

    expect(ticks).toHaveLength(7);
    expect(ticks[0]).toBe('2026-06-01');
    expect(ticks.at(-1)).toBe('2026-06-31');
  });

  it('always labels the latest day', () => {
    expect(sparseTicks(days(30)).at(-1)).toBe('2026-06-30');
  });

  it('keeps every label when there are only a few days', () => {
    expect(sparseTicks(days(4))).toEqual(days(4));
  });
});

describe('formatAxisDate', () => {
  it('shows a calendar day as written, whatever the time zone', () => {
    expect(formatAxisDate('2026-06-24')).toBe('24 Jun');
  });
});
