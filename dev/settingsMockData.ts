/**
 * The platform settings of the dev mock, kept in memory (a dev-server restart resets them), and the
 * rules PATCH /hire/admin/settings checks a change with. The rules copy settingsFormSchema in
 * src/modules/hire-admin/schemas/adminSettings.ts; settingsMockData.test.ts runs both side by side.
 */
import type {
  HireAdminSettings,
  SettingsPatch
} from '../src/modules/hire-admin/schemas/adminSettings.ts';

const TIMEZONES: readonly string[] = ['Asia/Kolkata', 'Asia/Dubai', 'Asia/Singapore', 'UTC'];
const RETENTION_MONTHS: readonly number[] = [6, 12, 24, 36, 60];
const EXPIRY_DAYS = { min: 1, max: 365 };
const MAX_ACTIVE_JOBS = { min: 1, max: 500 };
const REVIEW_SLA_DAYS = { min: 1, max: 30 };
const REMINDER_HOURS = { min: 1, max: 168 };
const EMPLOYMENT_TYPES: readonly string[] = ['Full-time', 'Part-time', 'Contract', 'Temporary'];
const JOB_VISIBILITIES: readonly string[] = ['Public (All Users)', 'Registered Users', 'Private'];
const CANDIDATE_STATUSES: readonly string[] = ['Applied', 'Under Review', 'Shortlisted'];

const EMAIL =
  /^(?:[A-Za-z0-9_'+-]+\.)*[A-Za-z0-9_'+-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9-]*\.)+[A-Za-z]{2,}$/;
const MOBILE = /^[6-9]\d{9}$/;

const LOGO_URL_HINT = 'The logo is uploaded on its own: POST /hire/admin/settings/logo.';

const DEFAULTS: HireAdminSettings = {
  platform_name: 'KitchenX Hiring',
  support_phone: '9878543210',
  support_email: 'support@kitchenx.com',
  timezone: 'Asia/Kolkata',
  logo_url: null,
  multi_business: true,
  enable_outlets: true,
  self_registration: false,
  business_verification: true,
  default_job_expiry_days: 30,
  max_active_jobs_per_recruiter: 50,
  default_employment_type: 'Full-time',
  job_visibility: 'Public (All Users)',
  require_job_approval: true,
  allow_editing_published_jobs: true,
  auto_close_expired_jobs: false,
  interview_scheduling: true,
  interview_type_online: true,
  interview_type_phone: true,
  interview_type_in_person: false,
  application_approval: false,
  auto_match_candidates: true,
  application_review_sla_days: 3,
  candidate_reminder_hours: 24,
  recruiter_reminder_hours: 2,
  application_confirmation: true,
  interview_confirmation: true,
  require_resume: true,
  allow_multiple_applications: true,
  default_candidate_status: 'Applied',
  show_similar_jobs: true,
  data_retention_months: 24,
  allow_data_export: true,
  archive_inactive_records: true
};

let current: HireAdminSettings = { ...DEFAULTS };

/** The saved settings. A copy, so callers cannot change the store by accident. */
export const getSettings = (): HireAdminSettings => ({ ...current });

/** Applies the fields given (already checked by validateSettingsPatch) and returns the whole settings. */
export function updateSettings(patch: SettingsPatch): HireAdminSettings {
  current = { ...current, ...patch };
  return getSettings();
}

/** Keeps an uploaded logo, as a data URL, and returns the whole settings. */
export function setSettingsLogo(logoUrl: string): HireAdminSettings {
  current = { ...current, logo_url: logoUrl };
  return getSettings();
}

/** Back to the settings of the picture. */
export function resetSettingsStore(): void {
  current = { ...DEFAULTS };
}

type Checked<T> = { value: T } | { error: string };

const trimmed = (value: unknown) => (typeof value === 'string' ? value.trim() : undefined);

const flag = (value: unknown): Checked<boolean> =>
  typeof value === 'boolean' ? { value } : { error: 'Must be true or false.' };

/** A mobile number as the API stores it: 10 digits, whatever spaces, dashes, brackets or +91 were typed. */
const normalizeMobile = (raw: string) =>
  raw.replace(/[\s()-]/g, '').replace(/^(\+91|91|0)(?=\d{10}$)/, '');

/** One checker per setting. `satisfies` makes a setting added to HireAdminSettings fail to compile here. */
const CHECKS = {
  platform_name(value: unknown): Checked<string> {
    const name = trimmed(value);
    if (name === undefined || name.length < 2) {
      return { error: 'Enter the platform name (at least 2 letters)' };
    }
    return name.length > 60 ? { error: 'Keep the name under 60 characters' } : { value: name };
  },
  support_phone(value: unknown): Checked<string> {
    const raw = trimmed(value);
    if (raw === '') return { value: '' };
    const phone = normalizeMobile(raw ?? '');
    return MOBILE.test(phone) ? { value: phone } : { error: 'Enter a 10-digit mobile number' };
  },
  support_email(value: unknown): Checked<string> {
    const email = trimmed(value);
    if (!email) return { error: 'Enter a support email' };
    if (email.length > 120) return { error: 'Keep the email under 120 characters' };
    return EMAIL.test(email) ? { value: email } : { error: 'Enter a valid email address' };
  },
  timezone: (value: unknown): Checked<string> =>
    typeof value === 'string' && TIMEZONES.includes(value)
      ? { value }
      : { error: 'Choose a timezone' },
  multi_business: flag,
  enable_outlets: flag,
  self_registration: flag,
  business_verification: flag,
  default_job_expiry_days(value: unknown): Checked<number> {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return { error: 'Enter the number of days' };
    }
    if (!Number.isInteger(value)) return { error: 'Use whole days' };
    if (value < EXPIRY_DAYS.min) return { error: `Use at least ${EXPIRY_DAYS.min} day` };
    return value > EXPIRY_DAYS.max ? { error: `Use at most ${EXPIRY_DAYS.max} days` } : { value };
  },
  max_active_jobs_per_recruiter(value: unknown): Checked<number> {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return { error: 'Enter the maximum number of jobs' };
    }
    if (!Number.isInteger(value)) return { error: 'Use a whole number' };
    if (value < MAX_ACTIVE_JOBS.min) return { error: `Use at least ${MAX_ACTIVE_JOBS.min}` };
    return value > MAX_ACTIVE_JOBS.max
      ? { error: `Use at most ${MAX_ACTIVE_JOBS.max}` }
      : { value };
  },
  default_employment_type: (value: unknown): Checked<string> =>
    typeof value === 'string' && EMPLOYMENT_TYPES.includes(value)
      ? { value }
      : { error: 'Choose an employment type' },
  job_visibility: (value: unknown): Checked<string> =>
    typeof value === 'string' && JOB_VISIBILITIES.includes(value)
      ? { value }
      : { error: 'Choose who can see jobs' },
  require_job_approval: flag,
  allow_editing_published_jobs: flag,
  auto_close_expired_jobs: flag,
  interview_scheduling: flag,
  interview_type_online: flag,
  interview_type_phone: flag,
  interview_type_in_person: flag,
  application_approval: flag,
  auto_match_candidates: flag,
  application_review_sla_days(value: unknown): Checked<number> {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return { error: 'Enter the number of days' };
    }
    if (!Number.isInteger(value)) return { error: 'Use whole days' };
    if (value < REVIEW_SLA_DAYS.min) {
      return { error: `Use at least ${REVIEW_SLA_DAYS.min} day` };
    }
    return value > REVIEW_SLA_DAYS.max
      ? { error: `Use at most ${REVIEW_SLA_DAYS.max} days` }
      : { value };
  },
  candidate_reminder_hours(value: unknown): Checked<number> {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return { error: 'Enter the number of hours' };
    }
    if (!Number.isInteger(value)) return { error: 'Use whole hours' };
    if (value < REMINDER_HOURS.min) {
      return { error: `Use at least ${REMINDER_HOURS.min} hour` };
    }
    return value > REMINDER_HOURS.max
      ? { error: `Use at most ${REMINDER_HOURS.max} hours` }
      : { value };
  },
  recruiter_reminder_hours(value: unknown): Checked<number> {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return { error: 'Enter the number of hours' };
    }
    if (!Number.isInteger(value)) return { error: 'Use whole hours' };
    if (value < REMINDER_HOURS.min) {
      return { error: `Use at least ${REMINDER_HOURS.min} hour` };
    }
    return value > REMINDER_HOURS.max
      ? { error: `Use at most ${REMINDER_HOURS.max} hours` }
      : { value };
  },
  application_confirmation: flag,
  interview_confirmation: flag,
  require_resume: flag,
  allow_multiple_applications: flag,
  default_candidate_status: (value: unknown): Checked<string> =>
    typeof value === 'string' && CANDIDATE_STATUSES.includes(value)
      ? { value }
      : { error: 'Choose a candidate status' },
  show_similar_jobs: flag,
  data_retention_months: (value: unknown): Checked<number> =>
    typeof value === 'number' && RETENTION_MONTHS.includes(value)
      ? { value }
      : { error: 'Choose how long to keep data' },
  allow_data_export: flag,
  archive_inactive_records: flag
} satisfies Record<keyof Required<SettingsPatch>, unknown>;

/**
 * Checks the keys of a PATCH body. `patch` holds the fields that are fine (text trimmed, phone as 10
 * digits); `fields` names every key that is not: a bad value, a key that is not a setting, or
 * `logo_url`, which only the logo upload may change.
 */
export function validateSettingsPatch(body: Record<string, unknown>) {
  const accepted: [string, unknown][] = [];
  const rejected: [string, string][] = [];
  for (const [key, value] of Object.entries(body)) {
    if (key === 'logo_url') {
      rejected.push([key, LOGO_URL_HINT]);
    } else if (!Object.hasOwn(CHECKS, key)) {
      rejected.push([key, 'Unknown field.']);
    } else {
      const result = CHECKS[key as keyof typeof CHECKS](value);
      if ('error' in result) rejected.push([key, result.error]);
      else accepted.push([key, result.value]);
    }
  }
  return {
    patch: Object.fromEntries(accepted) as SettingsPatch,
    fields: Object.fromEntries(rejected)
  };
}
