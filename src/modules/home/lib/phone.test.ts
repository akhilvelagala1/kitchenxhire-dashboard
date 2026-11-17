import { formatMobile, isValidMobile, otpClock } from './phone';

describe('phone helpers', () => {
  it('accepts an Indian mobile of ten digits starting 6 to 9', () => {
    expect(isValidMobile('91', '9876543210')).toBe(true);
    expect(isValidMobile('91', '5876543210')).toBe(false);
    expect(isValidMobile('91', '98765')).toBe(false);
  });

  it('accepts eight to fifteen digits for other countries', () => {
    expect(isValidMobile('44', '1234567')).toBe(false);
    expect(isValidMobile('44', '12345678')).toBe(true);
  });

  it('groups an Indian number as five and five digits', () => {
    expect(formatMobile('91', '9876543210')).toBe('+91 98765 43210');
    expect(formatMobile('971', '501234567')).toBe('+971 501234567');
  });

  it('formats the resend countdown as minutes and seconds', () => {
    expect(otpClock(120)).toBe('02:00');
    expect(otpClock(9)).toBe('00:09');
  });
});
