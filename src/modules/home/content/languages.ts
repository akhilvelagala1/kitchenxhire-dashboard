export const HIRE_LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'हिन्दी' }
] as const;

export type HireLanguage = (typeof HIRE_LANGUAGE_OPTIONS)[number]['value'];

const STORAGE_KEY = 'kx-hire-language';

export function readHireLanguage(): HireLanguage {
  if (typeof localStorage === 'undefined') return 'en';
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'hi' ? 'hi' : 'en';
}

export function writeHireLanguage(value: HireLanguage) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, value);
}
