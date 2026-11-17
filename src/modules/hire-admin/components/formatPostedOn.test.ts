import { formatPostedOn } from './formatPostedOn';

describe('formatPostedOn', () => {
  it('writes day, short month, year and a 12-hour time', () => {
    expect(formatPostedOn('2026-06-24T10:24:00')).toMatch(/^24 Jun 2026, 10:24 AM$/i);
    expect(formatPostedOn('2026-06-24T17:42:00')).toMatch(/^24 Jun 2026, 0?5:42 PM$/i);
  });

  it('shows a dash for something that is not a date', () => {
    expect(formatPostedOn('not a date')).toBe('—');
  });
});
