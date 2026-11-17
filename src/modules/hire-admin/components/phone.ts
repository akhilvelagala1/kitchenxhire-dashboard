/** A mobile number as the API wants it: 10 digits, whatever spaces, dashes, brackets or +91 were typed. */
export function normalizePhone(raw: string): string {
  return raw.replace(/[\s()-]/g, '').replace(/^(\+91|91|0)(?=\d{10}$)/, '');
}

/** Ten digits starting 6 to 9, the shape of an Indian mobile number. */
export function isMobileNumber(normalized: string): boolean {
  return /^[6-9]\d{9}$/.test(normalized);
}
