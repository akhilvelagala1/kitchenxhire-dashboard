import { LogOut } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  readRecruiterAccountPreferences,
  writeRecruiterAccountPreferences
} from '../lib/recruiterAccountPreferencesStorage';
import { useRecruiterSession } from '../lib/recruiterSession';
import {
  DEFAULT_RECRUITER_ACCOUNT_PREFERENCES,
  type RecruiterAccountPreferences
} from '../schemas/recruiterAccountPreferences';
import { AccountActionRow, AccountSection, AccountSwitch } from './AccountSettingsControls';

interface RecruiterAccountSettingsSecurityPanelProps {
  accountId: string;
}

/** Recruiter equivalent of the job-seeker Security tab (AccountSettingsPanels.tsx). */
export function RecruiterAccountSettingsSecurityPanel({
  accountId
}: RecruiterAccountSettingsSecurityPanelProps) {
  const { clearSession } = useRecruiterSession();
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState<RecruiterAccountPreferences>(() => ({
    ...DEFAULT_RECRUITER_ACCOUNT_PREFERENCES,
    ...readRecruiterAccountPreferences(accountId)
  }));

  function onSecurityAlertsChange(next: boolean) {
    const updated: RecruiterAccountPreferences = { ...preferences, securityAlertsEnabled: next };
    setPreferences(updated);
    writeRecruiterAccountPreferences(accountId, updated);
  }

  function logoutOtherDevices() {
    clearSession();
    navigate('/');
  }

  return (
    <AccountSection title="Security" lead="Manage your account's security preferences.">
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-3 rounded-xl border border-line px-3 py-2">
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-extrabold text-ink">Security Alerts</span>
            <span className="block text-[12px] font-medium text-ink-500">
              Get notified about important activity on your account.
            </span>
          </span>
          <AccountSwitch
            checked={preferences.securityAlertsEnabled}
            label="Security Alerts"
            onChange={onSecurityAlertsChange}
          />
        </div>
        <AccountActionRow
          icon={LogOut}
          title="Logout from All Other Devices"
          lead="Ends your current session on this device."
          tone="danger"
          onClick={logoutOtherDevices}
        />
      </div>
    </AccountSection>
  );
}
