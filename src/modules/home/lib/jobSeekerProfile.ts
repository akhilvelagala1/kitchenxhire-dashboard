import type { JobSeekerCandidateProfile } from '../schemas/jobSeekerOnboarding';

export interface JobSeekerProfile {
  displayName: string;
  initials: string;
}

/** Ten-digit Indian mobile from a formatted +91 string. */
function nationalMobileDigits(formattedPhone: string): string {
  const digits = formattedPhone.replace(/\D/g, '');
  if (digits.length >= 10) return digits.slice(-10);
  return digits;
}

function initialsFromName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'KM';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ''}${parts[parts.length - 1]![0] ?? ''}`.toUpperCase();
}

export function profileFromCandidate(candidate: JobSeekerCandidateProfile): JobSeekerProfile {
  return {
    displayName: candidate.fullName.trim(),
    initials: initialsFromName(candidate.fullName)
  };
}

const KNOWN_COMPLETE: Record<string, JobSeekerCandidateProfile & { profile: JobSeekerProfile }> = {
  '9876543210': {
    fullName: 'Surya Kumar',
    preferredRole: 'Cook / Chef',
    city: 'Hyderabad',
    workExperience: '1 - 3 Years',
    profile: { displayName: 'Surya Kumar', initials: 'SK' }
  },
  '9999999999': {
    fullName: 'Surya Kumar',
    preferredRole: 'Cook / Chef',
    city: 'Hyderabad',
    workExperience: '1 - 3 Years',
    profile: { displayName: 'Surya Kumar', initials: 'SK' }
  }
};

export function knownCompleteCandidate(phone: string):
  | (JobSeekerCandidateProfile & {
      profile: JobSeekerProfile;
    })
  | null {
  return KNOWN_COMPLETE[nationalMobileDigits(phone)] ?? null;
}

/** Fallback display until onboarding completes. */
export function placeholderJobSeekerProfile(): JobSeekerProfile {
  return { displayName: 'KitchenX Member', initials: 'KM' };
}

/** Demo display for a phone number when session state is not loaded (e.g. recruiter menu). */
export function resolveJobSeekerProfile(phone: string): JobSeekerProfile {
  const known = knownCompleteCandidate(phone);
  if (known) return known.profile;
  return placeholderJobSeekerProfile();
}

export function canApplyWithProfile(
  profileComplete: boolean,
  candidate: JobSeekerCandidateProfile | undefined
): boolean {
  if (!profileComplete || !candidate) return false;
  return (
    candidate.fullName.trim().length >= 2 &&
    candidate.preferredRole.trim().length > 0 &&
    candidate.city.trim().length > 0
  );
}

export function missingApplyFields(candidate: JobSeekerCandidateProfile | undefined): {
  category: boolean;
  city: boolean;
} {
  return {
    category: !candidate?.preferredRole?.trim(),
    city: !candidate?.city?.trim()
  };
}
