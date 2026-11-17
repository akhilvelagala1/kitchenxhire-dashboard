import { describeChange, formatCount, formatDays, formatShare, sharePct } from './reportsFormat';

describe('reportsFormat', () => {
  it('groups thousands like the rest of the console', () => {
    expect(formatCount(1482)).toBe('1,482');
    expect(formatCount(24860)).toBe('24,860');
    expect(formatCount(86)).toBe('86');
  });

  it('works shares out from the counts with one decimal', () => {
    expect(formatShare(590, 8672)).toBe('6.8%');
    expect(formatShare(4960, 8672)).toBe('57.2%');
    expect(formatShare(2086, 8672)).toBe('24.1%');
    expect(formatShare(1036, 8672)).toBe('11.9%');
    expect(formatShare(428, 1482)).toBe('28.9%');
    expect(formatShare(86, 1482)).toBe('5.8%');
  });

  it('does not divide by zero', () => {
    expect(sharePct(5, 0)).toBe(0);
    expect(formatShare(0, 0)).toBe('0.0%');
  });
});

describe('describeChange', () => {
  it('calls a rise up and gives its size without a sign', () => {
    expect(describeChange(12)).toEqual({ pct: 12, direction: 'up' });
  });

  it('calls a fall down and gives its size as a positive number', () => {
    expect(describeChange(-22)).toEqual({ pct: 22, direction: 'down' });
  });

  it('calls no change flat', () => {
    expect(describeChange(0)).toEqual({ pct: 0, direction: 'flat' });
  });

  it('rounds the size to one decimal for a rise and for a fall', () => {
    expect(describeChange(7.26)).toEqual({ pct: 7.3, direction: 'up' });
    expect(describeChange(-12.34)).toEqual({ pct: 12.3, direction: 'down' });
  });

  it('calls a change that rounds to zero flat, up or down', () => {
    expect(describeChange(0.04)).toEqual({ pct: 0, direction: 'flat' });
    expect(describeChange(-0.04)).toEqual({ pct: 0, direction: 'flat' });
  });
});

describe('formatDays', () => {
  it('writes days with one decimal, even for a whole number', () => {
    expect(formatDays(6.8)).toBe('6.8 days');
    expect(formatDays(9)).toBe('9.0 days');
    expect(formatDays(6.84)).toBe('6.8 days');
  });

  it('writes a dash for a missing average instead of a number', () => {
    expect(formatDays(null)).toBe('—');
  });
});
