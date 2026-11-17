import { z } from 'zod';

export type JobPostMode = 'draft' | 'publish';

/** What the Post a Job form holds. Every field is a string except skills; numbers are converted on submit. */
export interface JobPostFormValues {
  title: string;
  job_category: string;
  department: string;
  openings: string;
  city: string;
  work_location: string;
  address: string;
  employment_type: string;
  salary_min: string;
  salary_max: string;
  work_shift: string;
  experience_required: string;
  description: string;
  responsibilities: string;
  requirements: string;
  skills: string[];
  /** YYYY-MM-DD */
  application_deadline: string;
  visibility: string;
}

/** What is POSTed to /hire/admin/jobs. */
export interface JobPostBody {
  title: string;
  job_category: string;
  department: string;
  openings: number | null;
  city: string;
  work_location: string;
  address: string;
  employment_type: string;
  salary_min: number | null;
  salary_max: number | null;
  work_shift: string;
  experience_required: string;
  description: string;
  responsibilities: string;
  requirements: string;
  skills: string[];
  application_deadline: string | null;
  visibility: string;
  status: 'active' | 'draft';
}

export const JOB_POST_DEFAULTS: JobPostFormValues = {
  title: '',
  job_category: '',
  department: '',
  openings: '',
  city: '',
  work_location: '',
  address: '',
  employment_type: '',
  salary_min: '',
  salary_max: '',
  work_shift: '',
  experience_required: '',
  description: '',
  responsibilities: '',
  requirements: '',
  skills: [],
  application_deadline: '',
  visibility: ''
};

export const JOB_TEXT_LIMIT = 500;

const TITLE_MAX = 100;
const ADDRESS_MAX = 200;
const SKILLS_MAX = 20;
const TEXT_MIN = 10;
const OPENINGS_MAX = 999;

export type JobPostOption = { value: string; label: string };

function sameLabel(labels: readonly string[]): readonly JobPostOption[] {
  return labels.map((label) => ({ value: label, label }));
}

/** The six "Jobs by Category" labels, so a created job lands in an existing category. */
export const JOB_CATEGORY_OPTIONS = sameLabel([
  'Cook / Chef',
  'Kitchen Helper',
  'Cleaning & Stewarding',
  'Delivery & Store Support',
  'Restaurant Manager',
  'Others'
]);

export const JOB_DEPARTMENT_OPTIONS = sameLabel([
  'Kitchen',
  'Service',
  'Housekeeping',
  'Delivery',
  'Administration',
  'Others'
]);

export const JOB_CITY_OPTIONS = sameLabel([
  'Hyderabad',
  'Secunderabad',
  'Bengaluru',
  'Chennai',
  'Mumbai',
  'Pune',
  'Delhi'
]);

export const JOB_WORK_LOCATION_OPTIONS = sameLabel(['On-site', 'Hybrid', 'Remote']);

export const JOB_EMPLOYMENT_TYPE_OPTIONS = sameLabel([
  'Full-time',
  'Part-time',
  'Contract',
  'Temporary',
  'Internship'
]);

export const JOB_WORK_SHIFT_OPTIONS = sameLabel([
  'Day Shift (9:00 AM – 6:00 PM)',
  'Morning Shift (6:00 AM – 2:00 PM)',
  'Evening Shift (2:00 PM – 10:00 PM)',
  'Night Shift (10:00 PM – 6:00 AM)',
  'Rotational'
]);

export const JOB_EXPERIENCE_OPTIONS = sameLabel([
  'Fresher',
  '0 – 1 Years',
  '1 – 2 Years',
  '2 – 4 Years',
  '4 – 6 Years',
  '6+ Years'
]);

export const JOB_VISIBILITY_OPTIONS: readonly JobPostOption[] = [
  { value: 'public', label: 'Public (Visible to all job seekers)' },
  { value: 'internal', label: 'Internal (Visible to admins and recruiters only)' }
];

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** Today in the browser's own time zone as YYYY-MM-DD. toISOString would give the UTC date. */
export function jobPostToday(): string {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** True for a YYYY-MM-DD string that is a real calendar day, so 2026-02-30 is not one. */
function isRealDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

/** A whole number from a form string, or null when the string is empty or not a whole number. */
function parseWhole(value: string): number | null {
  const text = value.trim();
  if (!/^-?\d+$/.test(text)) return null;
  const n = Number(text);
  return Number.isSafeInteger(n) ? n : null;
}

function selectField(options: readonly JobPostOption[], message: string, required: boolean) {
  const allowed = options.map((option) => option.value);
  return z
    .string()
    .refine((value) => allowed.includes(value) || (!required && value === ''), message);
}

interface NumberRule {
  min: number;
  max: number;
  missing: string;
  invalid: string;
  outOfRange: string;
}

function numberField(rule: NumberRule, required: boolean) {
  return z.string().superRefine((raw, ctx) => {
    const text = raw.trim();
    if (text === '') {
      if (required) ctx.addIssue({ code: 'custom', message: rule.missing });
      return;
    }
    const n = parseWhole(text);
    if (n === null) ctx.addIssue({ code: 'custom', message: rule.invalid });
    else if (n < rule.min || n > rule.max)
      ctx.addIssue({ code: 'custom', message: rule.outOfRange });
  });
}

function textField(label: string, missing: string, required: boolean) {
  const base = z
    .string()
    .trim()
    .max(JOB_TEXT_LIMIT, `${label} must be ${JOB_TEXT_LIMIT} characters or fewer`);
  return required ? base.min(TEXT_MIN, missing) : base;
}

function deadlineField(required: boolean) {
  return z.string().superRefine((raw, ctx) => {
    const text = raw.trim();
    if (text === '') {
      if (required) ctx.addIssue({ code: 'custom', message: 'Select the application deadline' });
      return;
    }
    if (!isRealDate(text)) ctx.addIssue({ code: 'custom', message: 'Enter a valid date' });
    else if (required && text < jobPostToday()) {
      ctx.addIssue({ code: 'custom', message: 'Deadline cannot be in the past' });
    }
  });
}

function salaryRule(which: 'minimum' | 'maximum'): NumberRule {
  return {
    min: 0,
    max: Number.MAX_SAFE_INTEGER,
    missing: `Enter the ${which} salary`,
    invalid: 'Enter the salary as a whole number, for example 15000',
    outOfRange: 'Salary cannot be negative'
  };
}

const OPENINGS_RULE: NumberRule = {
  min: 1,
  max: OPENINGS_MAX,
  missing: 'Enter the number of openings',
  invalid: 'Enter the openings as a whole number',
  outOfRange: `Openings must be between 1 and ${OPENINGS_MAX}`
};

/**
 * Publish needs every section filled in. A draft needs only a title, but whatever it does hold
 * must still be well formed, so a half-written draft can be saved and finished later.
 */
export function jobPostSchemaFor(mode: JobPostMode) {
  const required = mode === 'publish';
  const pick = (options: readonly JobPostOption[], message: string) =>
    selectField(options, message, required);
  const text = (label: string, missing: string) => textField(label, missing, required);
  return z
    .object({
      title: z
        .string()
        .trim()
        .min(2, 'Enter the job title (at least 2 characters)')
        .max(TITLE_MAX, `Job title must be ${TITLE_MAX} characters or fewer`),
      job_category: pick(JOB_CATEGORY_OPTIONS, 'Select the job category'),
      department: pick(JOB_DEPARTMENT_OPTIONS, 'Select the department'),
      openings: numberField(OPENINGS_RULE, required),
      city: pick(JOB_CITY_OPTIONS, 'Select the city'),
      work_location: pick(JOB_WORK_LOCATION_OPTIONS, 'Select the work location'),
      address: z
        .string()
        .trim()
        .max(ADDRESS_MAX, `Address must be ${ADDRESS_MAX} characters or fewer`),
      employment_type: pick(JOB_EMPLOYMENT_TYPE_OPTIONS, 'Select the employment type'),
      salary_min: numberField(salaryRule('minimum'), required),
      salary_max: numberField(salaryRule('maximum'), required),
      work_shift: pick(JOB_WORK_SHIFT_OPTIONS, 'Select the work shift'),
      experience_required: pick(JOB_EXPERIENCE_OPTIONS, 'Select the experience required'),
      description: text('Description', 'Describe the job (at least 10 characters)'),
      responsibilities: text(
        'Responsibilities',
        'List the responsibilities (at least 10 characters)'
      ),
      requirements: text('Requirements', 'List the requirements (at least 10 characters)'),
      skills: z.array(z.string()).max(SKILLS_MAX, `Add at most ${SKILLS_MAX} skills`),
      application_deadline: deadlineField(required),
      visibility: selectField(JOB_VISIBILITY_OPTIONS, 'Select who can see the job', required)
    })
    .superRefine((values, ctx) => {
      const min = parseWhole(values.salary_min);
      const max = parseWhole(values.salary_max);
      if (min !== null && max !== null && max < min) {
        ctx.addIssue({
          code: 'custom',
          path: ['salary_max'],
          message: 'Maximum salary must be at least the minimum'
        });
      }
    });
}

/** Skills trimmed, blanks dropped, repeats (ignoring case) removed. The first spelling wins. */
function cleanSkills(skills: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const skill of skills) {
    const trimmed = skill.trim();
    const key = trimmed.toLowerCase();
    if (trimmed === '' || seen.has(key)) continue;
    seen.add(key);
    out.push(trimmed);
  }
  return out;
}

/** The request body for POST /hire/admin/jobs. Draft saves as 'draft', publish as 'active'. */
export function toJobPostBody(values: JobPostFormValues, mode: JobPostMode): JobPostBody {
  return {
    title: values.title.trim(),
    job_category: values.job_category.trim(),
    department: values.department.trim(),
    openings: parseWhole(values.openings),
    city: values.city.trim(),
    work_location: values.work_location.trim(),
    address: values.address.trim(),
    employment_type: values.employment_type.trim(),
    salary_min: parseWhole(values.salary_min),
    salary_max: parseWhole(values.salary_max),
    work_shift: values.work_shift.trim(),
    experience_required: values.experience_required.trim(),
    description: values.description.trim(),
    responsibilities: values.responsibilities.trim(),
    requirements: values.requirements.trim(),
    skills: cleanSkills(values.skills),
    application_deadline: values.application_deadline.trim() || null,
    visibility: values.visibility.trim(),
    status: mode === 'publish' ? 'active' : 'draft'
  };
}
