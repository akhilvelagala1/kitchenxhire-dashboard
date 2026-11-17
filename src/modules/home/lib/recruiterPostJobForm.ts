import { POST_JOB_CATEGORY_OPTIONS } from '../content/recruiterPostJobFormOptions';
import { recruiterPostJobSchema, type RecruiterPostJobPayload } from '../schemas/recruiterPostJob';

export interface RecruiterPostJobDetailsState {
  jobTitle: string;
  jobCategory: string;
  openings: number;
  employmentType: string;
  workShift: string;
  monthlySalary: string;
}

export interface RecruiterPostJobRequirementsState {
  preferredGender: string;
  ageMin: number;
  ageMax: number;
  qualification: string;
  experience: string;
  jobDescription: string;
  workLocation: string;
}

export type RecruiterPostJobFormValues = RecruiterPostJobDetailsState &
  RecruiterPostJobRequirementsState;

export type RecruiterPostJobField = keyof RecruiterPostJobFormValues;

export type RecruiterPostJobIssues = Partial<Record<RecruiterPostJobField, string>>;

/** The order focus and scroll use when a submit finds several invalid fields. */
export const POST_JOB_FIELD_ORDER: RecruiterPostJobField[] = [
  'jobTitle',
  'jobCategory',
  'openings',
  'employmentType',
  'workShift',
  'monthlySalary',
  'preferredGender',
  'ageMin',
  'ageMax',
  'qualification',
  'experience',
  'jobDescription',
  'workLocation'
];

const POST_JOB_FOCUS_IDS: Record<RecruiterPostJobField, string> = {
  jobTitle: 'post-job-title',
  jobCategory: 'post-job-category',
  openings: 'post-job-openings',
  employmentType: 'post-job-employment-type',
  workShift: 'post-job-work-shift',
  monthlySalary: 'post-job-monthly-salary',
  preferredGender: 'post-job-preferred-gender',
  ageMin: 'post-job-age-min',
  ageMax: 'post-job-age-max',
  qualification: 'post-job-qualification',
  experience: 'post-job-experience',
  jobDescription: 'post-job-description',
  workLocation: 'post-job-work-location'
};

export const POST_JOB_DETAILS_DEFAULTS: RecruiterPostJobDetailsState = {
  jobTitle: '',
  jobCategory: POST_JOB_CATEGORY_OPTIONS[0]?.value ?? 'Cook / Chef',
  openings: 1,
  employmentType: 'full_time',
  workShift: 'day',
  monthlySalary: ''
};

export const POST_JOB_REQUIREMENTS_DEFAULTS: RecruiterPostJobRequirementsState = {
  preferredGender: 'any',
  ageMin: 18,
  ageMax: 40,
  qualification: 'not_required',
  experience: 'none',
  jobDescription: '',
  workLocation: ''
};

const FIELD_SET = new Set<string>(POST_JOB_FIELD_ORDER);

export function validatePostJob(
  values: RecruiterPostJobFormValues
): { ok: true; data: RecruiterPostJobPayload } | { ok: false; issues: RecruiterPostJobIssues } {
  const parsed = recruiterPostJobSchema.safeParse(values);
  if (parsed.success) return { ok: true, data: parsed.data };

  const issues: RecruiterPostJobIssues = {};
  for (const issue of parsed.error.issues) {
    const field = issue.path[0];
    if (typeof field !== 'string' || !FIELD_SET.has(field)) continue;
    const key = field as RecruiterPostJobField;
    if (!issues[key]) issues[key] = issue.message;
  }
  return { ok: false, issues };
}

export function firstPostJobIssue(
  values: RecruiterPostJobFormValues,
  field: RecruiterPostJobField
): string | undefined {
  const result = validatePostJob(values);
  return result.ok ? undefined : result.issues[field];
}

export function focusFirstPostJobInvalid(fields: string[]) {
  for (const field of POST_JOB_FIELD_ORDER) {
    if (!fields.includes(field)) continue;
    const control = document.getElementById(POST_JOB_FOCUS_IDS[field]);
    control?.scrollIntoView?.({ block: 'center' });
    control?.focus();
    return;
  }
}
