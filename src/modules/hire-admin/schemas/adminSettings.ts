import { z } from 'zod';
import { isMobileNumber, normalizePhone } from '../components/phone';

/** Zones without daylight saving, so the offset in the label is always right. */
export const SETTINGS_TIMEZONES = [
  { value: 'Asia/Kolkata', label: '(GMT+05:30) India Standard Time (IST)' },
  { value: 'Asia/Dubai', label: '(GMT+04:00) Gulf Standard Time (GST)' },
  { value: 'Asia/Singapore', label: '(GMT+08:00) Singapore Time (SGT)' },
  { value: 'UTC', label: '(GMT+00:00) Coordinated Universal Time (UTC)' }
] as const;

/** How long records are kept, in months. */
export const SETTINGS_RETENTION_MONTHS = [6, 12, 24, 36, 60] as const;

/** A job stays open for 1 to 365 days unless the person who posts it says otherwise. */
export const SETTINGS_EXPIRY_DAYS = { min: 1, max: 365 } as const;

/** How many active jobs one recruiter may hold at once. */
export const SETTINGS_MAX_ACTIVE_JOBS = { min: 1, max: 500 } as const;

/** Target days to review a new application. */
export const SETTINGS_REVIEW_SLA_DAYS = { min: 1, max: 30 } as const;

/** Reminder lead time before an interview, in hours. */
export const SETTINGS_REMINDER_HOURS = { min: 1, max: 168 } as const;

export const SETTINGS_EMPLOYMENT_TYPES = [
  'Full-time',
  'Part-time',
  'Contract',
  'Temporary'
] as const;
type SettingsEmploymentType = (typeof SETTINGS_EMPLOYMENT_TYPES)[number];

export const SETTINGS_JOB_VISIBILITIES = [
  'Public (All Users)',
  'Registered Users',
  'Private'
] as const;
type SettingsJobVisibility = (typeof SETTINGS_JOB_VISIBILITIES)[number];

export const SETTINGS_CANDIDATE_STATUSES = ['Applied', 'Under Review', 'Shortlisted'] as const;
type SettingsCandidateStatus = (typeof SETTINGS_CANDIDATE_STATUSES)[number];

export const SETTINGS_LOGO_TYPES = ['image/png', 'image/jpeg'] as const;
export const SETTINGS_LOGO_MAX_BYTES = 2 * 1024 * 1024;

/** The platform settings the General and Hiring & Jobs tabs edit, as the API sends them. */
export interface HireAdminSettings {
  platform_name: string;
  /** Empty, or 10 digits starting 6 to 9 (shown as +91 98785 43210). */
  support_phone: string;
  support_email: string;
  /** An IANA name from SETTINGS_TIMEZONES. */
  timezone: string;
  /** The uploaded logo, or null while the built-in KitchenX logo is in use. */
  logo_url: string | null;
  multi_business: boolean;
  enable_outlets: boolean;
  self_registration: boolean;
  business_verification: boolean;
  default_job_expiry_days: number;
  max_active_jobs_per_recruiter: number;
  default_employment_type: SettingsEmploymentType;
  job_visibility: SettingsJobVisibility;
  require_job_approval: boolean;
  allow_editing_published_jobs: boolean;
  auto_close_expired_jobs: boolean;
  interview_scheduling: boolean;
  interview_type_online: boolean;
  interview_type_phone: boolean;
  interview_type_in_person: boolean;
  application_approval: boolean;
  auto_match_candidates: boolean;
  application_review_sla_days: number;
  candidate_reminder_hours: number;
  recruiter_reminder_hours: number;
  application_confirmation: boolean;
  interview_confirmation: boolean;
  require_resume: boolean;
  allow_multiple_applications: boolean;
  default_candidate_status: SettingsCandidateStatus;
  show_similar_jobs: boolean;
  data_retention_months: number;
  allow_data_export: boolean;
  archive_inactive_records: boolean;
}

/** What PATCH /hire/admin/settings takes: any of the fields except the logo, which has its own upload. */
export type SettingsPatch = Partial<Omit<HireAdminSettings, 'logo_url'>>;

const TIMEZONE_VALUES = SETTINGS_TIMEZONES.map((zone) => zone.value) as [string, ...string[]];

export const settingsFormSchema = z.object({
  platform_name: z
    .string()
    .trim()
    .min(2, 'Enter the platform name (at least 2 letters)')
    .max(60, 'Keep the name under 60 characters'),
  support_phone: z
    .string()
    .trim()
    .refine(
      (value) => value === '' || isMobileNumber(normalizePhone(value)),
      'Enter a 10-digit mobile number'
    ),
  support_email: z
    .string()
    .trim()
    .min(1, 'Enter a support email')
    .max(120, 'Keep the email under 120 characters')
    .pipe(z.email('Enter a valid email address')),
  timezone: z.enum(TIMEZONE_VALUES, 'Choose a timezone'),
  multi_business: z.boolean(),
  enable_outlets: z.boolean(),
  self_registration: z.boolean(),
  business_verification: z.boolean(),
  default_job_expiry_days: z
    .number('Enter the number of days')
    .int('Use whole days')
    .min(SETTINGS_EXPIRY_DAYS.min, `Use at least ${SETTINGS_EXPIRY_DAYS.min} day`)
    .max(SETTINGS_EXPIRY_DAYS.max, `Use at most ${SETTINGS_EXPIRY_DAYS.max} days`),
  max_active_jobs_per_recruiter: z
    .number('Enter the maximum number of jobs')
    .int('Use a whole number')
    .min(SETTINGS_MAX_ACTIVE_JOBS.min, `Use at least ${SETTINGS_MAX_ACTIVE_JOBS.min}`)
    .max(SETTINGS_MAX_ACTIVE_JOBS.max, `Use at most ${SETTINGS_MAX_ACTIVE_JOBS.max}`),
  default_employment_type: z.enum(SETTINGS_EMPLOYMENT_TYPES, 'Choose an employment type'),
  job_visibility: z.enum(SETTINGS_JOB_VISIBILITIES, 'Choose who can see jobs'),
  require_job_approval: z.boolean(),
  allow_editing_published_jobs: z.boolean(),
  auto_close_expired_jobs: z.boolean(),
  interview_scheduling: z.boolean(),
  interview_type_online: z.boolean(),
  interview_type_phone: z.boolean(),
  interview_type_in_person: z.boolean(),
  application_approval: z.boolean(),
  auto_match_candidates: z.boolean(),
  application_review_sla_days: z
    .number('Enter the number of days')
    .int('Use whole days')
    .min(SETTINGS_REVIEW_SLA_DAYS.min, `Use at least ${SETTINGS_REVIEW_SLA_DAYS.min} day`)
    .max(SETTINGS_REVIEW_SLA_DAYS.max, `Use at most ${SETTINGS_REVIEW_SLA_DAYS.max} days`),
  candidate_reminder_hours: z
    .number('Enter the number of hours')
    .int('Use whole hours')
    .min(SETTINGS_REMINDER_HOURS.min, `Use at least ${SETTINGS_REMINDER_HOURS.min} hour`)
    .max(SETTINGS_REMINDER_HOURS.max, `Use at most ${SETTINGS_REMINDER_HOURS.max} hours`),
  recruiter_reminder_hours: z
    .number('Enter the number of hours')
    .int('Use whole hours')
    .min(SETTINGS_REMINDER_HOURS.min, `Use at least ${SETTINGS_REMINDER_HOURS.min} hour`)
    .max(SETTINGS_REMINDER_HOURS.max, `Use at most ${SETTINGS_REMINDER_HOURS.max} hours`),
  application_confirmation: z.boolean(),
  interview_confirmation: z.boolean(),
  require_resume: z.boolean(),
  allow_multiple_applications: z.boolean(),
  default_candidate_status: z.enum(SETTINGS_CANDIDATE_STATUSES, 'Choose a candidate status'),
  show_similar_jobs: z.boolean(),
  data_retention_months: z
    .number('Choose how long to keep data')
    .refine(
      (months) => (SETTINGS_RETENTION_MONTHS as readonly number[]).includes(months),
      'Choose how long to keep data'
    ),
  allow_data_export: z.boolean(),
  archive_inactive_records: z.boolean(),
  /** A logo chosen on this screen and not saved yet. */
  logo_file: z
    .instanceof(File)
    .nullable()
    .refine(
      (file) => !file || (SETTINGS_LOGO_TYPES as readonly string[]).includes(file.type),
      'Use a PNG or JPG image'
    )
    .refine(
      (file) => !file || file.size <= SETTINGS_LOGO_MAX_BYTES,
      'The logo must be 2 MB or smaller'
    )
});

export type SettingsFormValues = z.infer<typeof settingsFormSchema>;

/** The form fields that are on/off switches. */
export type SettingsSwitchField = {
  [K in keyof SettingsFormValues]: SettingsFormValues[K] extends boolean ? K : never;
}[keyof SettingsFormValues];

/** The saved settings as the form starts: everything but the logo URL, and no logo chosen yet. */
export function toFormValues(settings: HireAdminSettings): SettingsFormValues {
  return {
    platform_name: settings.platform_name,
    support_phone: settings.support_phone,
    support_email: settings.support_email,
    timezone: settings.timezone,
    multi_business: settings.multi_business,
    enable_outlets: settings.enable_outlets,
    self_registration: settings.self_registration,
    business_verification: settings.business_verification,
    default_job_expiry_days: settings.default_job_expiry_days,
    max_active_jobs_per_recruiter: settings.max_active_jobs_per_recruiter,
    default_employment_type: settings.default_employment_type,
    job_visibility: settings.job_visibility,
    require_job_approval: settings.require_job_approval,
    allow_editing_published_jobs: settings.allow_editing_published_jobs,
    auto_close_expired_jobs: settings.auto_close_expired_jobs,
    interview_scheduling: settings.interview_scheduling,
    interview_type_online: settings.interview_type_online,
    interview_type_phone: settings.interview_type_phone,
    interview_type_in_person: settings.interview_type_in_person,
    application_approval: settings.application_approval,
    auto_match_candidates: settings.auto_match_candidates,
    application_review_sla_days: settings.application_review_sla_days,
    candidate_reminder_hours: settings.candidate_reminder_hours,
    recruiter_reminder_hours: settings.recruiter_reminder_hours,
    application_confirmation: settings.application_confirmation,
    interview_confirmation: settings.interview_confirmation,
    require_resume: settings.require_resume,
    allow_multiple_applications: settings.allow_multiple_applications,
    default_candidate_status: settings.default_candidate_status,
    show_similar_jobs: settings.show_similar_jobs,
    data_retention_months: settings.data_retention_months,
    allow_data_export: settings.allow_data_export,
    archive_inactive_records: settings.archive_inactive_records,
    logo_file: null
  };
}
