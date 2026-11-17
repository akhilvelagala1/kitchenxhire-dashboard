import { Briefcase, MapPin } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { Dialog } from '@/shared/ui/Dialog';
import { CITIES } from '../content/nav';
import { ONBOARDING_CATEGORY_OPTIONS } from '../content/profileFormOptions';
import { missingApplyFields } from '../lib/jobSeekerProfile';
import { useJobSeekerSession } from '../lib/jobSeekerSession';
import type { JobSeekerCandidateProfile } from '../schemas/jobSeekerOnboarding';
import { ProfileIconSelect } from './ProfileIconSelect';
import { homeButton } from './styles';

export interface JobSeekerIncompleteProfileDialogProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function JobSeekerIncompleteProfileDialog({
  open,
  onClose,
  onComplete
}: JobSeekerIncompleteProfileDialogProps) {
  const { session, completeOnboarding } = useJobSeekerSession();
  const missing = missingApplyFields(session?.candidate);
  const [preferredRole, setPreferredRole] = useState(session?.candidate?.preferredRole ?? '');
  const [city, setCity] = useState(session?.candidate?.city ?? '');
  const [roleError, setRoleError] = useState<string | null>(null);
  const [cityError, setCityError] = useState<string | null>(null);

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextRole = missing.category ? preferredRole : (session?.candidate?.preferredRole ?? '');
    const nextCity = missing.city ? city : (session?.candidate?.city ?? '');
    let valid = true;
    if (missing.category && !nextRole.trim()) {
      setRoleError('Select a job category');
      valid = false;
    } else {
      setRoleError(null);
    }
    if (missing.city && !nextCity.trim()) {
      setCityError('Select your city');
      valid = false;
    } else {
      setCityError(null);
    }
    if (!valid) return;

    const candidate: JobSeekerCandidateProfile = {
      fullName: session?.candidate?.fullName ?? session?.profile.displayName ?? '',
      preferredRole: nextRole,
      city: nextCity,
      area: session?.candidate?.area,
      workExperience: session?.candidate?.workExperience
    };
    completeOnboarding(candidate);
    onComplete();
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Complete your profile to apply"
      className="m-auto w-[min(480px,calc(100%-32px))] rounded-3xl bg-surface p-6 text-ink shadow-dialog"
    >
      <p className="mt-1 text-sm font-medium text-ink-600">
        Add the details below so employers can match you with this job.
      </p>
      <form className="mt-5 space-y-5" onSubmit={onSubmit}>
        {missing.category && (
          <ProfileIconSelect
            label="Job Category"
            icon={Briefcase}
            name="preferredRole"
            value={preferredRole}
            onChange={(value) => {
              setPreferredRole(value);
              setRoleError(null);
            }}
            error={roleError ? { type: 'manual', message: roleError } : undefined}
            options={ONBOARDING_CATEGORY_OPTIONS}
            placeholder="Select category"
          />
        )}
        {missing.city && (
          <ProfileIconSelect
            label="City"
            icon={MapPin}
            name="city"
            value={city}
            onChange={(value) => {
              setCity(value);
              setCityError(null);
            }}
            error={cityError ? { type: 'manual', message: cityError } : undefined}
            options={CITIES.map((city) => ({ value: city, label: city }))}
            placeholder="Select city"
          />
        )}
        <div className="flex flex-wrap gap-3 pt-2">
          <button type="submit" className={cn(homeButton('orange-base'), 'min-h-11 px-6')}>
            Save and apply
          </button>
          <button
            type="button"
            onClick={onClose}
            className={cn(homeButton('white-base'), 'min-h-11 px-6')}
          >
            Cancel
          </button>
        </div>
      </form>
    </Dialog>
  );
}
