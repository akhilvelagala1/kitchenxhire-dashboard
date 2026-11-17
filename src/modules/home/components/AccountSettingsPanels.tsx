import { useState } from 'react';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { Button } from '@/shared/ui/Button';
import { Dialog } from '@/shared/ui/Dialog';
import { Field } from '@/shared/ui/Field';
import { Input } from '@/shared/ui/Input';
import {
  ACCOUNT_VISIBILITY_OPTIONS,
  type AccountSettingsTab,
  type AccountSettingsValues
} from '../lib/accountSettings';
import { AccountSection, AccountSwitch } from './AccountSettingsControls';
import { ProfileIconSelect } from './ProfileIconSelect';

interface PanelProps {
  tx: (text: string) => string;
  values: AccountSettingsValues;
  onChange: (patch: Partial<AccountSettingsValues>) => void;
  onPassword: () => void;
}

export function AccountSettingsTabPanel({
  tab,
  tx,
  values,
  onChange,
  onPassword
}: PanelProps & { tab: Exclude<AccountSettingsTab, 'profile'> }) {
  if (tab === 'security') {
    return (
      <AccountSection title={tx('Security')} lead={tx('Choose a new password for this account.')}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[13px] font-extrabold text-ink">{tx('Password')}</p>
            <p className="text-[12px] font-medium text-ink-500">
              {tx('Update your account password.')}
            </p>
          </div>
          <button
            type="button"
            onClick={onPassword}
            className="h-10 shrink-0 rounded-full bg-brand-600 px-4 text-[13px] font-extrabold text-white"
          >
            {tx('Change Password')}
          </button>
        </div>
      </AccountSection>
    );
  }

  if (tab === 'notifications') {
    const rows = [
      ['jobAlerts', 'Job Alerts', 'Receive job recommendations and latest job updates.'],
      [
        'applicationUpdates',
        'Application updates',
        'Hear when an employer responds to an application.'
      ],
      [
        'interviewNotifications',
        'Interview notifications',
        'Get interview time and status updates.'
      ],
      [
        'promotionalNotifications',
        'Promotional notifications',
        'Occasional news about KitchenX Hiring.'
      ]
    ] as const;
    return (
      <AccountSection
        title={tx('Notifications')}
        lead={tx('Receive job recommendations and latest job updates.')}
      >
        <ul className="flex flex-col gap-2">
          {rows.map(([key, title, lead]) => (
            <li
              key={key}
              className="flex items-center gap-3 rounded-xl border border-line px-3 py-2"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-extrabold text-ink">{tx(title)}</span>
                <span className="block text-[12px] font-medium text-ink-500">{tx(lead)}</span>
              </span>
              <AccountSwitch
                checked={values[key]}
                label={tx(title)}
                onChange={(next) => onChange({ [key]: next })}
              />
            </li>
          ))}
        </ul>
      </AccountSection>
    );
  }

  return (
    <AccountSection title={tx('Privacy')} lead={tx('Who can see your profile.')}>
      <div className="flex flex-col gap-2.5">
        <ProfileIconSelect
          label={tx('Profile visibility')}
          name="account-visibility"
          value={values.profileVisibility}
          onChange={(profileVisibility) =>
            onChange({
              profileVisibility:
                profileVisibility === 'everyone' || profileVisibility === 'only-me'
                  ? profileVisibility
                  : 'employers'
            })
          }
          options={ACCOUNT_VISIBILITY_OPTIONS.map((option) => ({
            value: option.value,
            label: tx(option.label)
          }))}
          variant="settings"
        />
        <label className="flex items-center justify-between gap-3 text-[13px] font-bold text-ink">
          {tx('Show my mobile number to employers')}
          <AccountSwitch
            checked={values.showMobileToEmployers}
            label={tx('Show my mobile number to employers')}
            onChange={(showMobileToEmployers) => onChange({ showMobileToEmployers })}
          />
        </label>
        <label className="flex items-center justify-between gap-3 text-[13px] font-bold text-ink">
          {tx('Show my email to employers')}
          <AccountSwitch
            checked={values.showEmailToEmployers}
            label={tx('Show my email to employers')}
            onChange={(showEmailToEmployers) => onChange({ showEmailToEmployers })}
          />
        </label>
      </div>
    </AccountSection>
  );
}

export function AccountPasswordDialog({
  open,
  tx,
  onClose,
  onSaved
}: {
  open: boolean;
  tx: (text: string) => string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  function save() {
    if (next.trim().length < 6) {
      setError(tx('Enter a new password.'));
      return;
    }
    if (next !== confirm) {
      setError(tx('Passwords do not match.'));
      return;
    }
    setNext('');
    setConfirm('');
    setError('');
    onSaved();
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={tx('Change Password')}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {tx('Cancel')}
          </Button>
          <Button onClick={save}>{tx('Update password')}</Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <Field label={tx('New password')}>
          <Input type="password" value={next} onChange={(event) => setNext(event.target.value)} />
        </Field>
        <Field label={tx('Confirm password')} error={error || undefined}>
          <Input
            type="password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
          />
        </Field>
      </div>
    </Dialog>
  );
}

export function AccountDeleteDialog({
  open,
  tx,
  onCancel,
  onConfirm
}: {
  open: boolean;
  tx: (text: string) => string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <ConfirmDialog
      open={open}
      title={tx('Delete this account?')}
      message={tx('This removes the account from this browser. This cannot be undone.')}
      confirmLabel={tx('Delete Account')}
      onCancel={onCancel}
      onConfirm={() => onConfirm()}
    />
  );
}
