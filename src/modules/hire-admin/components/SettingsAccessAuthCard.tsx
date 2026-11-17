import { useState } from 'react';
import { Clock3, Lock, LockKeyhole, TriangleAlert } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Select } from '@/shared/ui/Input';
import { Switch } from '@/shared/ui/Switch';
import {
  SETTINGS_FAILED_ATTEMPTS_OPTIONS,
  SETTINGS_LOCK_DURATION_OPTIONS,
  SETTINGS_SESSION_TIMEOUT_OPTIONS,
  type SettingsFailedAttemptsOption,
  type SettingsLockDurationOption,
  type SettingsSessionTimeoutOption
} from '../schemas/adminSettingsSecurity';
import { SettingsCard } from './SettingsCard';
import { SettingsPasswordPolicyDialog } from './SettingsPasswordPolicyDialog';
import { SettingsRow } from './SettingsRow';
import {
  SECURITY_ACTION_BTN,
  SECURITY_CARD_CLASS,
  SECURITY_ROWS_CLASS,
  SECURITY_SELECT_CLASS,
  SECURITY_SWITCH
} from './settingsSecurityDensity';
import { useCanEditSettings } from './settingsEditContext';
import { useSecuritySettingsDraft } from './securitySettingsContext';

/** Left card: 2FA, Password Policy, Session Timeout, Failed Login Attempts, Account Lock Duration. */
export function SettingsAccessAuthCard() {
  const canEdit = useCanEditSettings();
  const {
    draft,
    setTwoFactorAuth,
    setSessionTimeout,
    setFailedLoginAttempts,
    setAccountLockDuration
  } = useSecuritySettingsDraft();
  const [passwordOpen, setPasswordOpen] = useState(false);

  return (
    <>
      <SettingsCard
        title="Access & Authentication"
        description="Manage platform security and access."
        className={SECURITY_CARD_CLASS}
      >
        <div className={SECURITY_ROWS_CLASS}>
          <SettingsRow
            icon={LockKeyhole}
            tone="purple"
            title="Two-Factor Authentication (2FA)"
            description="Require 2FA for all admin users"
          >
            <Switch
              checked={draft.two_factor_auth}
              onCheckedChange={setTwoFactorAuth}
              disabled={!canEdit}
              aria-label="Two-Factor Authentication (2FA)"
              className={SECURITY_SWITCH}
            />
          </SettingsRow>
          <SettingsRow
            icon={Lock}
            tone="blue"
            title="Password Policy"
            description="Configure password rules"
          >
            <Button
              variant="secondary"
              disabled={!canEdit}
              onClick={() => setPasswordOpen(true)}
              className={SECURITY_ACTION_BTN}
            >
              Configure
            </Button>
          </SettingsRow>
          <SettingsRow
            icon={Clock3}
            tone="pink"
            title="Session Timeout"
            description="Auto logout after inactivity"
          >
            <Select
              aria-label="Session Timeout"
              disabled={!canEdit}
              value={draft.session_timeout}
              onChange={(event) =>
                setSessionTimeout(event.target.value as SettingsSessionTimeoutOption)
              }
              className={SECURITY_SELECT_CLASS}
            >
              {SETTINGS_SESSION_TIMEOUT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </SettingsRow>
          <SettingsRow
            icon={TriangleAlert}
            tone="orange"
            title="Failed Login Attempts"
            description="Lock account after consecutive failures"
          >
            <Select
              aria-label="Failed Login Attempts"
              disabled={!canEdit}
              value={draft.failed_login_attempts}
              onChange={(event) =>
                setFailedLoginAttempts(event.target.value as SettingsFailedAttemptsOption)
              }
              className={SECURITY_SELECT_CLASS}
            >
              {SETTINGS_FAILED_ATTEMPTS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </SettingsRow>
          <SettingsRow
            icon={LockKeyhole}
            tone="green"
            title="Account Lock Duration"
            description="How long to lock the account"
            className="border-b-0"
          >
            <Select
              aria-label="Account Lock Duration"
              disabled={!canEdit}
              value={draft.account_lock_duration}
              onChange={(event) =>
                setAccountLockDuration(event.target.value as SettingsLockDurationOption)
              }
              className={SECURITY_SELECT_CLASS}
            >
              {SETTINGS_LOCK_DURATION_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </SettingsRow>
        </div>
      </SettingsCard>
      <SettingsPasswordPolicyDialog open={passwordOpen} onClose={() => setPasswordOpen(false)} />
    </>
  );
}
