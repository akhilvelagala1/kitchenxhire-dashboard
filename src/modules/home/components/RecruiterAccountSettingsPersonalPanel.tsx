import { Camera, CheckCircle2, Mail } from 'lucide-react';
import { useState, type ChangeEvent } from 'react';
import { cn } from '@/shared/lib/cn';
import { Input } from '@/shared/ui/Input';
import {
  recruiterInitials,
  saveRecruiterProfile,
  useRecruiterProfile
} from '../lib/recruiterOnboarding';
import { recruiterOnboardingSchema, type RecruiterProfile } from '../schemas/recruiterOnboarding';
import { AccountSection } from './AccountSettingsControls';
import { homeButton } from './styles';

const fieldLabel = 'text-[13px] font-bold text-ink';
const fieldInput = 'h-11 rounded-xl border border-line bg-surface px-3 text-[13px] font-semibold';
const fieldInputReadOnly = 'bg-muted/30 text-ink-600';

interface PersonalDraft {
  fullName: string;
  email: string;
  photoDataUrl: string;
}

function toDraft(profile: RecruiterProfile | null): PersonalDraft {
  return {
    fullName: profile?.fullName ?? '',
    email: profile?.email ?? '',
    photoDataUrl: profile?.photoDataUrl ?? ''
  };
}

interface RecruiterAccountSettingsPersonalPanelProps {
  accountId: string;
  phone: string;
}

/** Recruiter equivalent of the job-seeker Personal Information card (AccountSettingsProfile.tsx). */
export function RecruiterAccountSettingsPersonalPanel({
  accountId,
  phone
}: RecruiterAccountSettingsPersonalPanelProps) {
  const profile = useRecruiterProfile(phone);
  const [draft, setDraft] = useState<PersonalDraft>(() => toDraft(profile));
  const [trackedProfile, setTrackedProfile] = useState(profile);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Reseed whenever the stored profile changes underneath us (first load, or another tab's save).
  if (profile !== trackedProfile) {
    setTrackedProfile(profile);
    setDraft(toDraft(profile));
    setError('');
    setNotice('');
  }

  const initials = recruiterInitials(draft.fullName || 'Recruiter');

  function patch(next: Partial<PersonalDraft>) {
    setDraft((current) => ({ ...current, ...next }));
    setError('');
    setNotice('');
  }

  function onPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') patch({ photoDataUrl: reader.result });
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  }

  function cancel() {
    setDraft(toDraft(profile));
    setError('');
    setNotice('');
  }

  function save() {
    if (!profile) return;
    const fullName = draft.fullName.trim();
    if (!fullName) {
      setNotice('');
      setError('Please enter your full name.');
      return;
    }
    const email = draft.email.trim();
    const emailCheck = recruiterOnboardingSchema.shape.email.safeParse(email);
    if (!emailCheck.success) {
      setNotice('');
      setError(emailCheck.error.issues[0]?.message ?? 'Enter a valid email address.');
      return;
    }
    setError('');
    saveRecruiterProfile(accountId, {
      ...profile,
      fullName,
      email: email || undefined,
      photoDataUrl: draft.photoDataUrl || undefined
    });
    setNotice('Saved on this device.');
  }

  return (
    <AccountSection
      title="Personal Information"
      lead="Update your basic account and contact information."
    >
      <div className="flex flex-col gap-3">
        <div className="grid gap-3 min-[900px]:grid-cols-[72px_minmax(0,1fr)] min-[900px]:items-start">
          <div className="relative size-[72px]">
            {draft.photoDataUrl ? (
              <img
                src={draft.photoDataUrl}
                alt=""
                className="size-[72px] rounded-full object-cover"
              />
            ) : (
              <span className="grid size-[72px] place-items-center rounded-full bg-brand-600 text-xl font-extrabold text-white">
                {initials}
              </span>
            )}
            <label className="absolute right-0 bottom-0 grid size-6 cursor-pointer place-items-center rounded-full border border-line bg-surface text-brand-600 shadow-btn-white">
              <Camera className="size-3.5" aria-hidden="true" />
              <span className="sr-only">Change profile photo</span>
              <input
                type="file" // guard-allow: recruiter account photo picker mirrors the job seeker settings screen
                accept="image/*"
                className="sr-only"
                onChange={onPhoto}
              />
            </label>
          </div>
          <div className="grid gap-2.5 min-[720px]:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className={fieldLabel}>Full Name</span>
              <Input
                value={draft.fullName}
                onChange={(event) => patch({ fullName: event.target.value })}
                className={fieldInput}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className={fieldLabel}>Email Address (Optional)</span>
              <span className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-400" />
                <Input
                  type="email"
                  value={draft.email}
                  onChange={(event) => patch({ email: event.target.value })}
                  className={cn(fieldInput, 'pl-9')}
                />
              </span>
            </label>
            <label className="flex flex-col gap-1">
              <span className={fieldLabel}>Mobile Number</span>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={phone}
                  className={cn(fieldInput, fieldInputReadOnly, 'flex-1')}
                />
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-success-50 px-2 py-0.5 text-[11px] font-extrabold text-success-700">
                  <CheckCircle2 className="size-3.5" aria-hidden="true" />
                  Verified
                </span>
              </div>
            </label>
            <label className="flex flex-col gap-1">
              <span className={fieldLabel}>Designation</span>
              <Input readOnly value="Recruiter" className={cn(fieldInput, fieldInputReadOnly)} />
            </label>
          </div>
        </div>

        {error && (
          <p role="alert" className="text-[13px] font-semibold text-danger-600">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="text-[13px] font-semibold text-success-700">
            {notice}
          </p>
        )}

        <div className="mt-2 flex items-center justify-between gap-3">
          <button type="button" onClick={cancel} className={homeButton('white-slim')}>
            Cancel
          </button>
          <button type="button" onClick={save} className={homeButton('orange-slim')}>
            Save Changes
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </AccountSection>
  );
}
