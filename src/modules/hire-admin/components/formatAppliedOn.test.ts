import { formatAppliedOn } from './formatAppliedOn';

describe('formatAppliedOn', () => {
  it('shows the date and time in India time with a zero-padded hour', () => {
    expect(formatAppliedOn('2026-06-24T09:18:00+05:30')).toBe('24 Jun 2026, 09:18 AM');
  });

  it('shows the same text whatever offset the timestamp carries', () => {
    expect(formatAppliedOn('2026-06-24T04:48:00Z')).toBe('24 Jun 2026, 10:18 AM');
  });

  it('writes the afternoon as PM', () => {
    expect(formatAppliedOn('2026-06-23T17:42:00+05:30')).toBe('23 Jun 2026, 05:42 PM');
  });

  it('shows a dash when the timestamp is not a date', () => {
    expect(formatAppliedOn('not a date')).toBe('—');
  });
});
