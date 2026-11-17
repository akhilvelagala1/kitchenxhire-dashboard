import { PROFILE_EXPERIENCE_OPTIONS, PROFILE_ROLE_OPTIONS } from './profileFormOptions';

export const POST_JOB_EMPLOYMENT_TYPES = [
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' }
] as const;

export const POST_JOB_SHIFTS = [
  { value: 'day', label: 'Day Shift (9 AM - 6 PM)' },
  { value: 'night', label: 'Night Shift' },
  { value: 'rotational', label: 'Rotational' }
] as const;

export const POST_JOB_GENDER = [
  { value: 'any', label: 'Any' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' }
] as const;

export const POST_JOB_QUALIFICATION = [
  { value: 'not_required', label: 'Not Required' },
  { value: '10th', label: '10th Pass' },
  { value: '12th', label: '12th Pass' },
  { value: 'diploma', label: 'Diploma' }
] as const;

export const POST_JOB_EXPERIENCE = [
  { value: 'none', label: 'No Experience' },
  ...PROFILE_EXPERIENCE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))
] as const;

export const POST_JOB_AGE_OPTIONS = Array.from({ length: 43 }, (_, i) => 18 + i);

export const POST_JOB_CATEGORY_OPTIONS = PROFILE_ROLE_OPTIONS;

export const POST_JOB_TITLE_MAX = 100;
export const POST_JOB_DESCRIPTION_MIN = 30;
export const POST_JOB_DESCRIPTION_MAX = 1000;
export const POST_JOB_LOCATION_MAX = 150;
export const POST_JOB_SALARY_MAX = 99_99_999;
export const POST_JOB_SALARY_MAX_DIGITS = 7;
