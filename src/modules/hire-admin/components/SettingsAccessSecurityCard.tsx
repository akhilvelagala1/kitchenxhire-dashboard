import { useId } from 'react';
import { ClipboardList, KeyRound, Lock, Shield } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Input } from '@/shared/ui/Input';
import { Switch } from '@/shared/ui/Switch';
import { SETTINGS_SESSION_TIMEOUT } from '../schemas/adminSettingsUsersRoles';
import { SettingsCard } from './SettingsCard';
import { SettingsRow } from './SettingsRow';
import {
  USERS_ROLES_CARD_CLASS,
  USERS_ROLES_ROWS_CLASS,
  USERS_ROLES_SWITCH
} from './settingsUsersRolesDensity';
import { useCanEditSettings } from './settingsEditContext';
import { useUsersRolesSettingsDraft } from './usersRolesSettingsContext';

/** Bottom-right card: 2FA, session timeout, activity logging, and IP restriction. */
export function SettingsAccessSecurityCard() {
  const canEdit = useCanEditSettings();
  const { draft, setTwoFactor, setSessionTimeout, setActivityLogging, setIpRestriction } =
    useUsersRolesSettingsDraft();
  const timeoutId = useId();
  const timeoutTitle = `${timeoutId}-title`;
  const timeoutDesc = `${timeoutId}-desc`;

  return (
    <SettingsCard
      title="Access & Security"
      description="Authentication and session controls."
      className={USERS_ROLES_CARD_CLASS}
    >
      <div className={USERS_ROLES_ROWS_CLASS}>
        <SettingsRow
          icon={Lock}
          tone="blue"
          title="Two-Factor Authentication"
          description="Require 2FA for all admin accounts"
        >
          <Switch
            checked={draft.two_factor_auth}
            onCheckedChange={setTwoFactor}
            disabled={!canEdit}
            aria-label="Two-factor authentication"
            className={USERS_ROLES_SWITCH}
          />
        </SettingsRow>
        <SettingsRow
          icon={KeyRound}
          tone="amber"
          title="Session Timeout"
          description="Auto logout after inactivity"
          titleId={timeoutTitle}
          descriptionId={timeoutDesc}
        >
          <div className="flex items-center gap-2 lg:gap-[calc(8*var(--u))]">
            <Input
              type="number"
              inputMode="numeric"
              min={SETTINGS_SESSION_TIMEOUT.min}
              max={SETTINGS_SESSION_TIMEOUT.max}
              value={draft.session_timeout_minutes}
              aria-labelledby={timeoutTitle}
              aria-describedby={timeoutDesc}
              disabled={!canEdit}
              onChange={(event) => {
                const next = Number(event.target.value);
                if (Number.isFinite(next)) setSessionTimeout(next);
              }}
              className="w-[90px] text-center lg:h-[calc(38*var(--u))] lg:min-h-0 lg:w-[calc(90*var(--u))] lg:rounded-[calc(10*var(--u))] lg:px-[calc(8*var(--u))] lg:text-[calc(14*var(--u))]"
            />
            <span aria-hidden className="text-sm text-[#586987] lg:text-[calc(13*var(--u))]">
              minutes
            </span>
          </div>
        </SettingsRow>
        <SettingsRow
          icon={ClipboardList}
          tone="pink"
          title="User Activity Logging"
          description="Track user actions for audit"
        >
          <Switch
            checked={draft.user_activity_logging}
            onCheckedChange={setActivityLogging}
            disabled={!canEdit}
            aria-label="User activity logging"
            className={USERS_ROLES_SWITCH}
          />
        </SettingsRow>
        <SettingsRow
          icon={Shield}
          tone="green"
          title="IP Access Restriction"
          description="Limit access to approved IPs"
          className={cn('border-b-0')}
        >
          <Switch
            checked={draft.ip_access_restriction}
            onCheckedChange={setIpRestriction}
            disabled={!canEdit}
            aria-label="IP access restriction"
            className={USERS_ROLES_SWITCH}
          />
        </SettingsRow>
      </div>
    </SettingsCard>
  );
}
