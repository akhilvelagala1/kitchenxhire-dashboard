/**
 * In-memory Security Settings for the dev mock. Restarting the server resets them.
 * Defaults match the Security Settings reference. The world is fixed at 11 Nov 2026, India time, so
 * Login History and Active Sessions match the reference on any day; nothing here reads the clock.
 */
import type {
  SettingsActiveSession,
  SettingsLoginHistoryEntry,
  SettingsSecurity
} from '../src/modules/hire-admin/schemas/adminSettingsSecurity.ts';

const DEFAULTS: SettingsSecurity = {
  two_factor_auth: true,
  password_policy: {
    min_length: 8,
    require_uppercase: true,
    require_number: true,
    require_symbol: false,
    expiry_days: 90,
    reuse_count: 3
  },
  session_timeout: '30 minutes',
  failed_login_attempts: '5 attempts',
  account_lock_duration: '15 minutes',
  ip_restriction: false
};

let current: SettingsSecurity = structuredClone(DEFAULTS);

export function getSecuritySettings(): SettingsSecurity {
  return structuredClone(current);
}

export function replaceSecuritySettings(next: SettingsSecurity): SettingsSecurity {
  current = structuredClone(next);
  return structuredClone(current);
}

/** Test-only: puts the in-memory store back to its defaults between tests. */
export function resetSecuritySettings(): SettingsSecurity {
  current = structuredClone(DEFAULTS);
  return structuredClone(current);
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const SESSION_TIMEOUTS = new Set(['15 minutes', '30 minutes', '45 minutes', '60 minutes']);
const FAILED_ATTEMPTS = new Set(['3 attempts', '5 attempts', '10 attempts']);
const LOCK_DURATIONS = new Set(['5 minutes', '15 minutes', '30 minutes', '60 minutes']);

/**
 * Validates a full replace body for PATCH /hire/admin/settings/security.
 * Returns field errors when anything is wrong; otherwise the normalised payload.
 */
export function validateSecurityBody(body: unknown): {
  value?: SettingsSecurity;
  fields: Record<string, string>;
} {
  const fields: Record<string, string> = {};
  if (!isRecord(body)) {
    return { fields: { body: 'Send the Security settings as a JSON object' } };
  }

  if (typeof body.two_factor_auth !== 'boolean') fields.two_factor_auth = 'Must be true or false';
  if (typeof body.ip_restriction !== 'boolean') fields.ip_restriction = 'Must be true or false';
  if (typeof body.session_timeout !== 'string' || !SESSION_TIMEOUTS.has(body.session_timeout)) {
    fields.session_timeout = 'Choose 15, 30, 45 or 60 minutes';
  }
  if (
    typeof body.failed_login_attempts !== 'string' ||
    !FAILED_ATTEMPTS.has(body.failed_login_attempts)
  ) {
    fields.failed_login_attempts = 'Choose 3, 5 or 10 attempts';
  }
  if (
    typeof body.account_lock_duration !== 'string' ||
    !LOCK_DURATIONS.has(body.account_lock_duration)
  ) {
    fields.account_lock_duration = 'Choose 5, 15, 30 or 60 minutes';
  }
  if (!isRecord(body.password_policy)) {
    fields.password_policy = 'Send the password policy';
    return { fields };
  }

  const policy = body.password_policy;
  const minLength = policy.min_length;
  if (
    typeof minLength !== 'number' ||
    !Number.isInteger(minLength) ||
    minLength < 6 ||
    minLength > 32
  ) {
    fields['password_policy.min_length'] = 'Use a whole number from 6 to 32';
  }
  const expiry = policy.expiry_days;
  if (typeof expiry !== 'number' || !Number.isInteger(expiry) || expiry < 0 || expiry > 365) {
    fields['password_policy.expiry_days'] = 'Use a whole number from 0 to 365';
  }
  const reuse = policy.reuse_count;
  if (typeof reuse !== 'number' || !Number.isInteger(reuse) || reuse < 0 || reuse > 10) {
    fields['password_policy.reuse_count'] = 'Use a whole number from 0 to 10';
  }
  for (const key of ['require_uppercase', 'require_number', 'require_symbol'] as const) {
    if (typeof policy[key] !== 'boolean')
      fields[`password_policy.${key}`] = 'Must be true or false';
  }

  if (Object.keys(fields).length > 0) return { fields };

  return {
    fields: {},
    value: {
      two_factor_auth: body.two_factor_auth as boolean,
      ip_restriction: body.ip_restriction as boolean,
      session_timeout: body.session_timeout as SettingsSecurity['session_timeout'],
      failed_login_attempts:
        body.failed_login_attempts as SettingsSecurity['failed_login_attempts'],
      account_lock_duration:
        body.account_lock_duration as SettingsSecurity['account_lock_duration'],
      password_policy: {
        min_length: minLength as number,
        require_uppercase: policy.require_uppercase as boolean,
        require_number: policy.require_number as boolean,
        require_symbol: policy.require_symbol as boolean,
        expiry_days: expiry as number,
        reuse_count: reuse as number
      }
    }
  };
}

const LOGIN_HISTORY: SettingsLoginHistoryEntry[] = [
  {
    id: 'login-1',
    user_name: 'Priya Nair',
    occurred_at: '2026-11-11T09:12:00+05:30',
    ip_address: '103.21.58.10',
    device: 'Chrome on macOS',
    result: 'success'
  },
  {
    id: 'login-2',
    user_name: 'Ananya Rao',
    occurred_at: '2026-11-11T08:47:00+05:30',
    ip_address: '49.207.12.44',
    device: 'Safari on iPhone',
    result: 'success'
  },
  {
    id: 'login-3',
    user_name: 'Unknown',
    occurred_at: '2026-11-10T23:58:00+05:30',
    ip_address: '185.220.101.7',
    device: 'Chrome on Windows',
    result: 'failed'
  },
  {
    id: 'login-4',
    user_name: 'Vikram Shetty',
    occurred_at: '2026-11-10T18:30:00+05:30',
    ip_address: '117.96.4.21',
    device: 'Edge on Windows',
    result: 'success'
  },
  {
    id: 'login-5',
    user_name: 'Ananya Rao',
    occurred_at: '2026-11-10T14:05:00+05:30',
    ip_address: '49.207.12.44',
    device: 'Safari on iPhone',
    result: 'failed'
  }
];

let sessions: SettingsActiveSession[] = [
  {
    id: 'session-1',
    user_name: 'Priya Nair',
    device: 'Chrome on macOS',
    ip_address: '103.21.58.10',
    location: 'Hyderabad, India',
    last_active_at: '2026-11-11T09:30:00+05:30',
    is_current: true
  },
  {
    id: 'session-2',
    user_name: 'Priya Nair',
    device: 'KitchenX app on iPhone',
    ip_address: '49.37.80.3',
    location: 'Hyderabad, India',
    last_active_at: '2026-11-11T07:55:00+05:30',
    is_current: false
  },
  {
    id: 'session-3',
    user_name: 'Ananya Rao',
    device: 'Safari on iPhone',
    ip_address: '49.207.12.44',
    location: 'Bengaluru, India',
    last_active_at: '2026-11-11T08:47:00+05:30',
    is_current: false
  },
  {
    id: 'session-4',
    user_name: 'Vikram Shetty',
    device: 'Edge on Windows',
    ip_address: '117.96.4.21',
    location: 'Chennai, India',
    last_active_at: '2026-11-10T18:34:00+05:30',
    is_current: false
  }
];

export function getLoginHistory(): SettingsLoginHistoryEntry[] {
  return structuredClone(LOGIN_HISTORY);
}

export function getActiveSessions(): SettingsActiveSession[] {
  return structuredClone(sessions);
}

/** Removes one session (never the current one). Returns the sessions that remain, or undefined if not found. */
export function revokeActiveSession(id: string): SettingsActiveSession[] | undefined {
  const target = sessions.find((session) => session.id === id);
  if (!target || target.is_current) return undefined;
  sessions = sessions.filter((session) => session.id !== id);
  return structuredClone(sessions);
}

/** Test-only: puts the sessions list back to its defaults between tests. */
export function resetActiveSessions(): void {
  sessions = [
    {
      id: 'session-1',
      user_name: 'Priya Nair',
      device: 'Chrome on macOS',
      ip_address: '103.21.58.10',
      location: 'Hyderabad, India',
      last_active_at: '2026-11-11T09:30:00+05:30',
      is_current: true
    },
    {
      id: 'session-2',
      user_name: 'Priya Nair',
      device: 'KitchenX app on iPhone',
      ip_address: '49.37.80.3',
      location: 'Hyderabad, India',
      last_active_at: '2026-11-11T07:55:00+05:30',
      is_current: false
    },
    {
      id: 'session-3',
      user_name: 'Ananya Rao',
      device: 'Safari on iPhone',
      ip_address: '49.207.12.44',
      location: 'Bengaluru, India',
      last_active_at: '2026-11-11T08:47:00+05:30',
      is_current: false
    },
    {
      id: 'session-4',
      user_name: 'Vikram Shetty',
      device: 'Edge on Windows',
      ip_address: '117.96.4.21',
      location: 'Chennai, India',
      last_active_at: '2026-11-10T18:34:00+05:30',
      is_current: false
    }
  ];
}
