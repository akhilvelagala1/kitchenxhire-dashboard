import { z } from 'zod';

/** Session Timeout options on Access & Authentication (reference order). */
export const SETTINGS_SESSION_TIMEOUT_OPTIONS = [
  '15 minutes',
  '30 minutes',
  '45 minutes',
  '60 minutes'
] as const;
export type SettingsSessionTimeoutOption = (typeof SETTINGS_SESSION_TIMEOUT_OPTIONS)[number];

/** Failed Login Attempts options (reference order). */
export const SETTINGS_FAILED_ATTEMPTS_OPTIONS = [
  '3 attempts',
  '5 attempts',
  '10 attempts'
] as const;
export type SettingsFailedAttemptsOption = (typeof SETTINGS_FAILED_ATTEMPTS_OPTIONS)[number];

/** Account Lock Duration options (reference order). */
export const SETTINGS_LOCK_DURATION_OPTIONS = [
  '5 minutes',
  '15 minutes',
  '30 minutes',
  '60 minutes'
] as const;
export type SettingsLockDurationOption = (typeof SETTINGS_LOCK_DURATION_OPTIONS)[number];

const SETTINGS_PASSWORD_MIN_LENGTH = { min: 6, max: 32 } as const;
/** 0 means passwords never expire. */
const SETTINGS_PASSWORD_EXPIRY_DAYS = { min: 0, max: 365 } as const;
/** How many of a user's past passwords they cannot reuse; 0 means reuse is allowed. */
const SETTINGS_PASSWORD_REUSE_COUNT = { min: 0, max: 10 } as const;

export interface SettingsPasswordPolicy {
  min_length: number;
  require_uppercase: boolean;
  require_number: boolean;
  require_symbol: boolean;
  expiry_days: number;
  reuse_count: number;
}

/** The Security Settings payload: Access & Authentication and Additional Security toggles. */
export interface SettingsSecurity {
  two_factor_auth: boolean;
  password_policy: SettingsPasswordPolicy;
  session_timeout: SettingsSessionTimeoutOption;
  failed_login_attempts: SettingsFailedAttemptsOption;
  account_lock_duration: SettingsLockDurationOption;
  ip_restriction: boolean;
}

export const settingsPasswordPolicyFormSchema = z.object({
  min_length: z
    .number('Enter the minimum length')
    .int('Use a whole number')
    .min(SETTINGS_PASSWORD_MIN_LENGTH.min, `Use at least ${SETTINGS_PASSWORD_MIN_LENGTH.min}`)
    .max(SETTINGS_PASSWORD_MIN_LENGTH.max, `Use at most ${SETTINGS_PASSWORD_MIN_LENGTH.max}`),
  require_uppercase: z.boolean(),
  require_number: z.boolean(),
  require_symbol: z.boolean(),
  expiry_days: z
    .number('Enter the number of days')
    .int('Use whole days')
    .min(SETTINGS_PASSWORD_EXPIRY_DAYS.min, `Use at least ${SETTINGS_PASSWORD_EXPIRY_DAYS.min}`)
    .max(SETTINGS_PASSWORD_EXPIRY_DAYS.max, `Use at most ${SETTINGS_PASSWORD_EXPIRY_DAYS.max}`),
  reuse_count: z
    .number('Enter how many past passwords to block')
    .int('Use a whole number')
    .min(SETTINGS_PASSWORD_REUSE_COUNT.min, `Use at least ${SETTINGS_PASSWORD_REUSE_COUNT.min}`)
    .max(SETTINGS_PASSWORD_REUSE_COUNT.max, `Use at most ${SETTINGS_PASSWORD_REUSE_COUNT.max}`)
});

export type SettingsPasswordPolicyFormValues = z.infer<typeof settingsPasswordPolicyFormSchema>;

type SettingsLoginResult = 'success' | 'failed';

/** One row of Login History: who signed in, when, from where, on what, and whether it worked. */
export interface SettingsLoginHistoryEntry {
  id: string;
  user_name: string;
  /** ISO timestamp, India time. */
  occurred_at: string;
  ip_address: string;
  device: string;
  result: SettingsLoginResult;
}

/** One row of Active Sessions: a signed-in device that can be revoked. */
export interface SettingsActiveSession {
  id: string;
  user_name: string;
  device: string;
  ip_address: string;
  location: string;
  /** ISO timestamp, India time. */
  last_active_at: string;
  /** The session this request is made from; it has no revoke action. */
  is_current: boolean;
}
