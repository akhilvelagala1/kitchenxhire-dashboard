import { useState } from 'react';
import {
  readRecruiterAccountPreferences,
  writeRecruiterAccountPreferences
} from '../lib/recruiterAccountPreferencesStorage';
import {
  DEFAULT_RECRUITER_ACCOUNT_PREFERENCES,
  type RecruiterAccountPreferences
} from '../schemas/recruiterAccountPreferences';
import { AccountSection, AccountSwitch } from './AccountSettingsControls';

interface RecruiterAccountSettingsNotificationsPanelProps {
  accountId: string;
}

const rows = [
  ['notifyJobPosted', 'Job Posted', 'Get notified when your job post goes live.'],
  ['notifyJobApproved', 'Job Approved', 'Get notified when a job posting is approved.'],
  ['notifyJobRejected', 'Job Rejected', 'Get notified if a job posting is rejected.']
] as const;

/** Recruiter Account Settings — Notifications tab. Each toggle persists immediately. */
export function RecruiterAccountSettingsNotificationsPanel({
  accountId
}: RecruiterAccountSettingsNotificationsPanelProps) {
  const [preferences, setPreferences] = useState<RecruiterAccountPreferences>(
    () => readRecruiterAccountPreferences(accountId) ?? DEFAULT_RECRUITER_ACCOUNT_PREFERENCES
  );

  function onToggle(key: (typeof rows)[number][0], next: boolean) {
    const updated = { ...preferences, [key]: next };
    setPreferences(updated);
    writeRecruiterAccountPreferences(accountId, updated);
  }

  return (
    <AccountSection title="Notifications" lead="Choose which job updates you want to hear about.">
      <ul className="flex flex-col gap-2">
        {rows.map(([key, title, lead]) => (
          <li key={key} className="flex items-center gap-3 rounded-xl border border-line px-3 py-2">
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-extrabold text-ink">{title}</span>
              <span className="block text-[12px] font-medium text-ink-500">{lead}</span>
            </span>
            <AccountSwitch
              checked={preferences[key]}
              label={title}
              onChange={(next) => onToggle(key, next)}
            />
          </li>
        ))}
      </ul>
    </AccountSection>
  );
}
