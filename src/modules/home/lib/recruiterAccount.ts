/** Stable localStorage scope for recruiter prototype data (digits only, India 91 prefix when 10-digit). */
export function normalizeRecruiterAccountId(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  if (digits.length > 0) return digits;
  return 'unknown';
}

export function recruiterScopedStorageKey(baseKey: string, accountId: string): string {
  return `${baseKey}:${accountId}`;
}
