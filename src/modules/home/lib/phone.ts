export const COUNTRY_CODES = ['91', '971', '65', '44', '1'];

/** India needs a 10-digit number starting 6 to 9. Other countries accept 8 to 15 digits. */
export function isValidMobile(countryCode: string, digits: string): boolean {
  if (countryCode === '91') return /^[6-9]\d{9}$/.test(digits);
  return /^\d{8,15}$/.test(digits);
}

export function formatMobile(countryCode: string, digits: string): string {
  return countryCode === '91' && digits.length === 10
    ? `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`
    : `+${countryCode} ${digits}`;
}

export function otpClock(seconds: number): string {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}
