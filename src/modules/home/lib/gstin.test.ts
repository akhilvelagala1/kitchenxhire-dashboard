import { describe, expect, it } from 'vitest';
import { normalizeGstin, validateGstin } from './gstin';

describe('validateGstin', () => {
  it('accepts a checksum-valid GST number and returns its state', () => {
    expect(validateGstin('36AABCU9603R1ZO')).toEqual({
      valid: true,
      value: '36AABCU9603R1ZO',
      state: 'Telangana'
    });
  });

  it('normalises spaces and lower-case letters before checking', () => {
    expect(validateGstin(' 36aabcu9603r1zo ')).toMatchObject({
      valid: true,
      value: '36AABCU9603R1ZO'
    });
  });

  it('rejects a number that is not 15 characters', () => {
    expect(validateGstin('36AABCU9603R1Z')).toMatchObject({
      valid: false,
      message: expect.stringContaining('exactly 15')
    });
  });

  it('rejects a number whose state code is outside the supported states', () => {
    expect(validateGstin('07AABCU9603R1ZM')).toMatchObject({
      valid: false,
      message: expect.stringContaining('supported states')
    });
  });

  it('rejects a number that fails its check digit', () => {
    expect(validateGstin('36AABCU9603R1ZM')).toMatchObject({
      valid: false,
      message: expect.stringContaining('not valid')
    });
  });

  it('rejects a malformed PAN block', () => {
    expect(validateGstin('36ABCU9603R1Z0')).toMatchObject({ valid: false });
  });
});

describe('normalizeGstin', () => {
  it('removes spaces and upper-cases the value', () => {
    expect(normalizeGstin(' 36 aabcu9603r1zo ')).toBe('36AABCU9603R1ZO');
  });
});
