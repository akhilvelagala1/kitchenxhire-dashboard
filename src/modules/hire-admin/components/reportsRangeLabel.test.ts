import { rangeLabel } from './reportsRangeLabel';

afterEach(() => vi.unstubAllEnvs());

describe('rangeLabel', () => {
  it('writes the 30 days ending on the last day with the year once', () => {
    expect(rangeLabel('30d', '2026-06-24')).toBe('26 May – 24 Jun 2026');
  });

  it('counts 7 and 90 days back with the last day included', () => {
    expect(rangeLabel('7d', '2026-06-24')).toBe('18 Jun – 24 Jun 2026');
    expect(rangeLabel('90d', '2026-06-24')).toBe('27 Mar – 24 Jun 2026');
  });

  it('writes both years when the window crosses New Year', () => {
    expect(rangeLabel('30d', '2026-01-01')).toBe('3 Dec 2025 – 1 Jan 2026');
    expect(rangeLabel('90d', '2026-02-10')).toBe('13 Nov 2025 – 10 Feb 2026');
  });

  it.each(['Pacific/Kiritimati', 'Pacific/Pago_Pago'])(
    'keeps the same dates when the browser is in %s',
    (zone) => {
      vi.stubEnv('TZ', zone);
      expect(rangeLabel('30d', '2026-06-24')).toBe('26 May – 24 Jun 2026');
    }
  );
});
