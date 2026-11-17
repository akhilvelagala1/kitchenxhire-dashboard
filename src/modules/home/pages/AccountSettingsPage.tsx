import { Bell, Lock, Shield, UserRound } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { cn } from '@/shared/lib/cn';
import {
  AccountDeleteDialog,
  AccountPasswordDialog,
  AccountSettingsTabPanel
} from '../components/AccountSettingsPanels';
import {
  AccountSettingsFooter,
  AccountSettingsProfile
} from '../components/AccountSettingsProfile';
import { ProfileBenefitsPanel } from '../components/ProfileBenefitsPanel';
import { secLead, secTitle } from '../components/styles';
import { useHireLanguage } from '../hooks/useHireLanguage';
import {
  accountSettingsError,
  type AccountSettingsTab,
  type AccountSettingsValues
} from '../lib/accountSettings';
import {
  clearAccountSettings,
  readAccountSettings,
  writeAccountSettings
} from '../lib/accountSettingsStorage';
import { useJobSeekerSession } from '../lib/jobSeekerSession';

const TABS: { id: AccountSettingsTab; label: string; icon: typeof UserRound }[] = [
  { id: 'profile', label: 'Profile & Account', icon: UserRound },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy', icon: Lock }
];

export function AccountSettingsPage() {
  const navigate = useNavigate();
  const { session, clearSession } = useJobSeekerSession();
  const { language, setLanguage, tx } = useHireLanguage();
  const phone = session?.phone ?? '';
  const [saved, setSaved] = useState(() => readAccountSettings(phone, session));
  const [draft, setDraft] = useState(saved);
  const [languageDraft, setLanguageDraft] = useState(language);
  const [tab, setTab] = useState<AccountSettingsTab>('profile');
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  function patch(next: Partial<AccountSettingsValues>) {
    setDraft((current) => ({ ...current, ...next }));
    setError('');
  }

  function save() {
    const problem = accountSettingsError(draft);
    if (problem) {
      setError(tx(problem));
      setTab('profile');
      return;
    }
    writeAccountSettings(phone, draft);
    setSaved(draft);
    setLanguage(languageDraft);
    setNotice(tx('Saved on this device.'));
  }

  function cancel() {
    setDraft(saved);
    setLanguageDraft(language);
    setError('');
    setNotice('');
  }

  function removeAccount() {
    clearAccountSettings(phone);
    clearSession();
    navigate('/');
  }

  return (
    <>
      <title>KitchenX Hiring | Account Settings</title>
      <div className="grid grid-cols-1 gap-4 min-[1280px]:grid-cols-[minmax(0,1fr)_308px] min-[1280px]:items-stretch min-[1280px]:gap-6">
        <div className="flex min-w-0 flex-col gap-3">
          <div>
            <h1 // guard-allow: job seeker account settings matches the hire prototype, not console PageHeader
              className={secTitle}
            >
              {tx('Account Settings')}
            </h1>
            <p className={secLead}>
              {tx('Manage your account, security, notifications, and privacy preferences.')}
            </p>
          </div>
          <div
            className="flex flex-nowrap gap-1.5"
            role="tablist"
            aria-label={tx('Account Settings')}
          >
            {TABS.map(({ id, label, icon: Icon }) => {
              const on = tab === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setTab(id)}
                  className={cn(
                    'inline-flex h-8 shrink-0 items-center gap-1 rounded-full px-2.5 text-[12px] font-extrabold whitespace-nowrap',
                    on
                      ? 'bg-brand-600 text-white shadow-btn-orange-slim'
                      : 'border border-line bg-surface text-ink-700'
                  )}
                >
                  <Icon className="size-3.5" aria-hidden="true" />
                  {tx(label)}
                </button>
              );
            })}
          </div>
          <div role="tabpanel">
            {tab === 'profile' ? (
              <AccountSettingsProfile
                tx={tx}
                values={draft}
                language={languageDraft}
                onChange={patch}
                onLanguage={setLanguageDraft}
                onPassword={() => setPasswordOpen(true)}
                onDelete={() => setDeleteOpen(true)}
              />
            ) : (
              <AccountSettingsTabPanel
                tab={tab}
                tx={tx}
                values={draft}
                onChange={patch}
                onPassword={() => setPasswordOpen(true)}
              />
            )}
          </div>
          {error ? (
            <p role="alert" className="text-[13px] font-semibold text-danger-600">
              {error}
            </p>
          ) : null}
          <p className="sr-only" role="status">
            {notice}
          </p>
          <AccountSettingsFooter tx={tx} onCancel={cancel} onSave={save} />
        </div>
        <div className="min-w-0">
          <ProfileBenefitsPanel stretch />
        </div>
      </div>
      <AccountPasswordDialog
        key={passwordOpen ? 'open' : 'closed'}
        open={passwordOpen}
        tx={tx}
        onClose={() => setPasswordOpen(false)}
        onSaved={() => {
          setPasswordOpen(false);
          setNotice(tx('Password updated on this device.'));
        }}
      />
      <AccountDeleteDialog
        open={deleteOpen}
        tx={tx}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={removeAccount}
      />
    </>
  );
}
