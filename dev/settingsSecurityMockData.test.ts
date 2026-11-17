import { afterEach, describe, expect, it } from 'vitest';
import {
  getActiveSessions,
  getLoginHistory,
  getSecuritySettings,
  replaceSecuritySettings,
  resetActiveSessions,
  resetSecuritySettings,
  revokeActiveSession,
  validateSecurityBody
} from './settingsSecurityMockData.ts';

afterEach(() => {
  resetSecuritySettings();
  resetActiveSessions();
});

describe('settingsSecurityMockData', () => {
  it('starts with the reference defaults', () => {
    const data = getSecuritySettings();

    expect(data.two_factor_auth).toBe(true);
    expect(data.ip_restriction).toBe(false);
    expect(data.session_timeout).toBe('30 minutes');
    expect(data.failed_login_attempts).toBe('5 attempts');
    expect(data.account_lock_duration).toBe('15 minutes');
    expect(data.password_policy).toEqual({
      min_length: 8,
      require_uppercase: true,
      require_number: true,
      require_symbol: false,
      expiry_days: 90,
      reuse_count: 3
    });
  });

  it('rejects an unknown session timeout option', () => {
    const current = getSecuritySettings();
    const { fields } = validateSecurityBody({ ...current, session_timeout: '20 minutes' });

    expect(fields.session_timeout).toBeTruthy();
  });

  it('rejects a password policy minimum length out of range', () => {
    const current = getSecuritySettings();
    const { fields } = validateSecurityBody({
      ...current,
      password_policy: { ...current.password_policy, min_length: 3 }
    });

    expect(fields['password_policy.min_length']).toBeTruthy();
  });

  it('replaces the store with a valid payload', () => {
    const current = getSecuritySettings();
    const next = replaceSecuritySettings({
      ...current,
      two_factor_auth: false,
      session_timeout: '60 minutes'
    });

    expect(next.two_factor_auth).toBe(false);
    expect(next.session_timeout).toBe('60 minutes');
    expect(getSecuritySettings().session_timeout).toBe('60 minutes');
  });

  it('lists login history newest first, with a failed attempt recorded', () => {
    const history = getLoginHistory();

    expect(history.length).toBeGreaterThan(0);
    expect(history.some((entry) => entry.result === 'failed')).toBe(true);
  });

  it('lists active sessions with exactly one current session', () => {
    const sessions = getActiveSessions();

    expect(sessions.filter((session) => session.is_current)).toHaveLength(1);
  });

  it('revokes a non-current session and removes it from the list', () => {
    const before = getActiveSessions();
    const target = before.find((session) => !session.is_current)!;

    const after = revokeActiveSession(target.id);

    expect(after?.some((session) => session.id === target.id)).toBe(false);
    expect(getActiveSessions().some((session) => session.id === target.id)).toBe(false);
  });

  it('refuses to revoke the current session or an unknown one', () => {
    const current = getActiveSessions().find((session) => session.is_current)!;

    expect(revokeActiveSession(current.id)).toBeUndefined();
    expect(revokeActiveSession('does-not-exist')).toBeUndefined();
  });
});
