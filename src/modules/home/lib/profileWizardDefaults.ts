import {
  PROFILE_CITY_OPTIONS,
  PROFILE_EXPERIENCE_OPTIONS,
  PROFILE_ROLE_OPTIONS,
  PROFILE_SALARY_OPTIONS
} from '../content/profileFormOptions';
import {
  emptyProfileWizardValues,
  type ProfileWizardFormValues
} from '../schemas/jobSeekerProfileWizard';
import type { JobSeekerSessionState } from './jobSeekerSession';

function matchOption(
  options: readonly { value: string }[],
  raw: string | undefined,
  fallback = ''
): string {
  if (!raw?.trim()) return fallback;
  const exact = options.find((opt) => opt.value === raw);
  if (exact) return exact.value;
  const needle = raw.toLowerCase();
  const partial = options.find((opt) => {
    const cityRoot = opt.value.split(',')[0]?.trim().toLowerCase() ?? '';
    return opt.value.toLowerCase().includes(needle) || needle.includes(cityRoot);
  });
  return partial?.value ?? fallback;
}

/** Prefill wizard from session using option values the selects actually accept. */
export function buildProfileWizardDefaults(
  session: JobSeekerSessionState | null
): ProfileWizardFormValues {
  const mobile = session?.phone ?? '';
  const fullName = session?.candidate?.fullName ?? session?.profile.displayName ?? '';
  const hasCandidate = Boolean(session?.candidate);

  return {
    ...emptyProfileWizardValues,
    fullName: fullName === 'KitchenX Member' ? '' : fullName,
    mobile,
    city: matchOption(PROFILE_CITY_OPTIONS, session?.candidate?.city),
    preferredRole: matchOption(PROFILE_ROLE_OPTIONS, session?.candidate?.preferredRole),
    workExperience: matchOption(PROFILE_EXPERIENCE_OPTIONS, session?.candidate?.workExperience),
    expectedSalary: hasCandidate ? (PROFILE_SALARY_OPTIONS[1]?.value ?? '') : '',
    primarySkills: '',
    highestQualification: ''
  };
}
