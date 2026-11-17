import type { RecruiterOnboardingField } from '../schemas/recruiterOnboarding';

const FOCUS_ORDER: RecruiterOnboardingField[] = [
  'fullName',
  'businessName',
  'businessType',
  'city',
  'email'
];

/** Focus the first invalid control, including the custom listbox triggers. */
export function focusFirstInvalid(fields: RecruiterOnboardingField[]) {
  for (const field of FOCUS_ORDER) {
    if (!fields.includes(field)) continue;
    if (field === 'businessType' || field === 'city') {
      document
        .querySelector<HTMLElement>(`button[id^="${field}-"][aria-haspopup="listbox"]`)
        ?.focus();
      return;
    }
    document.getElementById(`recruiter-onboarding-${field}`)?.focus();
    return;
  }
}
