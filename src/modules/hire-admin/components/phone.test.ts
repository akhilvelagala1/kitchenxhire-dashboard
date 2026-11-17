import { isMobileNumber, normalizePhone } from './phone';

describe('normalizePhone', () => {
  it('turns what a person types into the 10 digits the API wants', () => {
    expect(normalizePhone('+91 98765 43210')).toBe('9876543210');
    expect(normalizePhone('98765-43210')).toBe('9876543210');
    expect(normalizePhone('(0) 9876543210')).toBe('9876543210');
    expect(normalizePhone('919876543210')).toBe('9876543210');
  });

  it('leaves a number that is already 10 digits alone', () => {
    expect(normalizePhone('9876543210')).toBe('9876543210');
  });
});

describe('isMobileNumber', () => {
  it('accepts ten digits starting 6 to 9 and nothing else', () => {
    expect(isMobileNumber('9876543210')).toBe(true);
    expect(isMobileNumber('6000000000')).toBe(true);
    expect(isMobileNumber('5876543210')).toBe(false);
    expect(isMobileNumber('987654321')).toBe(false);
    expect(isMobileNumber('98765432100')).toBe(false);
  });
});
