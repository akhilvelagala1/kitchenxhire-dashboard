/**
 * GSTIN validation: 15-character shape, registration state code and the
 * published mod-36 check digit. This proves the number is well formed; it does
 * not prove the registration is genuine — only the GST portal can do that.
 */

const GSTIN_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const GSTIN_PATTERN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

/** First two digits of a GSTIN are the registration state code. */
const GSTIN_STATE_CODES: Record<string, string> = {
  '27': 'Maharashtra',
  '29': 'Karnataka',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '36': 'Telangana',
  '37': 'Andhra Pradesh'
};

export type GstinCheck =
  { valid: true; value: string; state: string } | { valid: false; message: string; state?: string };

/** Remove spaces and upper-case so paste and lower-case typing behave the same. */
export function normalizeGstin(raw: string): string {
  return raw.replace(/\s+/g, '').toUpperCase();
}

function checkDigit(first14: string): string {
  let sum = 0;
  for (let index = 0; index < 14; index += 1) {
    const value = GSTIN_CHARS.indexOf(first14.charAt(index));
    const product = value * (index % 2 === 0 ? 1 : 2);
    sum += Math.floor(product / 36) + (product % 36);
  }
  return GSTIN_CHARS.charAt((36 - (sum % 36)) % 36);
}

export function validateGstin(raw: string): GstinCheck {
  const value = normalizeGstin(raw);
  if (value.length === 0) {
    return { valid: false, message: 'Enter your 15-character GST number.' };
  }
  if (value.length !== 15) {
    return { valid: false, message: 'GST number must be exactly 15 characters.' };
  }
  if (!GSTIN_PATTERN.test(value)) {
    return {
      valid: false,
      message: 'Enter a valid GST number (for example 36AABCU9603R1ZO).'
    };
  }
  const state = GSTIN_STATE_CODES[value.slice(0, 2)];
  if (!state) {
    return {
      valid: false,
      message: 'GST number must be registered in one of the supported states.'
    };
  }
  if (checkDigit(value.slice(0, 14)) !== value[14]) {
    return {
      valid: false,
      message: 'This GST number is not valid. Check all 15 characters.',
      state
    };
  }
  return { valid: true, value, state };
}
