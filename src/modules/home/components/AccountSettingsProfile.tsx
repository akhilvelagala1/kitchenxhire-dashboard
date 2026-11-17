import {
  Briefcase,
  Camera,
  CheckCircle2,
  Globe,
  KeyRound,
  Mail,
  MapPin,
  Phone,
  Trash2
} from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Input } from '@/shared/ui/Input';
import defaultAvatar from '../assets/hire-avatar-ramesh.jpg';
import { HIRE_LANGUAGE_OPTIONS, type HireLanguage } from '../content/languages';
import { PROFILE_CITY_OPTIONS } from '../content/profileFormOptions';
import { resumePhotoSrc } from '../lib/resumePhoto';
import type { AccountSettingsValues } from '../lib/accountSettings';
import { AccountActionRow, AccountSection, AccountSwitch } from './AccountSettingsControls';
import { ProfileIconSelect } from './ProfileIconSelect';
import { homeButton } from './styles';

const fieldLabel = 'text-[13px] font-bold text-ink';
const fieldInput = 'h-11 rounded-xl border border-line bg-surface px-3 text-[13px] font-semibold';

interface AccountSettingsProfileProps {
  tx: (text: string) => string;
  values: AccountSettingsValues;
  language: HireLanguage;
  onChange: (patch: Partial<AccountSettingsValues>) => void;
  onLanguage: (next: HireLanguage) => void;
  onPassword: () => void;
  onDelete: () => void;
}

export function AccountSettingsProfile({
  tx,
  values,
  language,
  onChange,
  onLanguage,
  onPassword,
  onDelete
}: AccountSettingsProfileProps) {
  const photo = resumePhotoSrc(values.photoDataUrl, defaultAvatar);

  function onPhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') onChange({ photoDataUrl: reader.result });
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  }

  return (
    <div className="space-y-2">
      <AccountSection
        title={tx('Account Information')}
        lead={tx('Update your basic account details.')}
      >
        <div className="grid gap-3 min-[900px]:grid-cols-[72px_minmax(0,1fr)] min-[900px]:items-start">
          <div className="relative size-[72px]">
            <img src={photo} alt="" className="size-[72px] rounded-full object-cover" />
            <label className="absolute right-0 bottom-0 grid size-6 cursor-pointer place-items-center rounded-full border border-line bg-surface text-brand-600 shadow-btn-white">
              <Camera className="size-3.5" aria-hidden="true" />
              <span className="sr-only">{tx('Change profile photo')}</span>
              <input
                type="file" // guard-allow: account photo picker on the job seeker settings screen
                accept="image/*"
                className="sr-only"
                onChange={onPhoto}
              />
            </label>
          </div>
          <div className="grid gap-2.5 min-[720px]:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className={fieldLabel}>{tx('Full Name')}</span>
              <Input
                value={values.fullName}
                onChange={(event) => onChange({ fullName: event.target.value })}
                className={fieldInput}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className={fieldLabel}>{tx('Email Address')}</span>
              <span className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-400" />
                <Input
                  type="email"
                  value={values.email}
                  onChange={(event) => onChange({ email: event.target.value })}
                  className={cn(fieldInput, 'pl-9')}
                />
              </span>
            </label>
            <label className="flex flex-col gap-1">
              <span className={fieldLabel}>{tx('Mobile Number')}</span>
              <span className="relative">
                <Phone className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-400" />
                <Input
                  value={values.mobile}
                  onChange={(event) => onChange({ mobile: event.target.value })}
                  className={cn(fieldInput, 'pr-24 pl-9')}
                />
                <span className="absolute top-1/2 right-2 inline-flex -translate-y-1/2 items-center gap-1 rounded-full bg-success-50 px-2 py-0.5 text-[11px] font-extrabold text-success-700">
                  <CheckCircle2 className="size-3.5" aria-hidden="true" />
                  {tx('Verified')}
                </span>
              </span>
            </label>
            <ProfileIconSelect
              label={tx('City / Location')}
              icon={MapPin}
              name="account-city"
              value={values.city}
              onChange={(city) => onChange({ city })}
              options={PROFILE_CITY_OPTIONS}
              variant="settings"
            />
          </div>
        </div>
      </AccountSection>

      <AccountSection
        title={tx('Account Preferences')}
        lead={tx('Set your language and job search preferences.')}
      >
        <div className="grid items-end gap-3 min-[720px]:grid-cols-2">
          <ProfileIconSelect
            label={tx('Language')}
            icon={Globe}
            name="account-language"
            value={language}
            onChange={(next) => onLanguage(next === 'hi' ? 'hi' : 'en')}
            options={HIRE_LANGUAGE_OPTIONS}
            variant="settings"
          />
          <div className="flex items-center gap-3 rounded-xl border border-line px-3 py-2">
            <Briefcase className="size-4 shrink-0 text-ink-500" aria-hidden="true" />
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-extrabold text-ink">{tx('Job Alerts')}</span>
              <span className="block text-[12px] font-medium text-ink-500">
                {tx('Receive job recommendations and latest job updates.')}
              </span>
            </span>
            <AccountSwitch
              checked={values.jobAlerts}
              label={tx('Job Alerts')}
              onChange={(jobAlerts) => onChange({ jobAlerts })}
            />
          </div>
        </div>
      </AccountSection>

      <AccountSection
        title={tx('Account Actions')}
        lead={tx('Manage your account access and data.')}
      >
        <div className="grid gap-2.5 min-[720px]:grid-cols-2">
          <AccountActionRow
            icon={KeyRound}
            title={tx('Change Password')}
            lead={tx('Update your account password.')}
            tone="brand"
            onClick={onPassword}
          />
          <AccountActionRow
            icon={Trash2}
            title={tx('Delete Account')}
            lead={tx('Permanently delete your account and all data.')}
            tone="danger"
            onClick={onDelete}
          />
        </div>
      </AccountSection>
    </div>
  );
}

export function AccountSettingsFooter({
  tx,
  onCancel,
  onSave
}: {
  tx: (text: string) => string;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <div className="mt-2 flex items-center justify-between gap-3">
      <button type="button" onClick={onCancel} className={homeButton('white-slim')}>
        {tx('Cancel')}
      </button>
      <button type="button" onClick={onSave} className={homeButton('orange-slim')}>
        {tx('Save Changes')}
        <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}
