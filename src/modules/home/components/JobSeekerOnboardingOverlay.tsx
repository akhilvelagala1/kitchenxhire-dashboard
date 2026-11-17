import { Briefcase, MapPin, User, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { cn } from '@/shared/lib/cn';
import { Dialog } from '@/shared/ui/Dialog';
import chefIllustration from '../assets/onboarding-chef.jpg';
import { useHomeState } from '../hooks/useHomeState';
import { useJobSeekerSession } from '../lib/jobSeekerSession';
import {
  type JobSeekerCandidateProfile,
  type JobSeekerOnboardingForm
} from '../schemas/jobSeekerOnboarding';
import { JobSeekerOnboardingFormFields } from './JobSeekerOnboardingForm';
import { homeButton } from './styles';

/**
 * Two-screen job seeker onboarding over the real /user Find Jobs portal.
 * Layout target: ~920×580, left ~38% branding + chef, right ~62% compact form.
 */
export function JobSeekerOnboardingOverlay() {
  const navigate = useNavigate();
  const { session, completeOnboarding, clearSession } = useJobSeekerSession();
  const { location, selectLocation } = useHomeState();
  const [phase, setPhase] = useState<'form' | 'success'>('form');
  const [saved, setSaved] = useState<JobSeekerCandidateProfile | null>(null);
  const [cityLocked, setCityLocked] = useState(Boolean(location?.trim()));
  const [dismissed, setDismissed] = useState(false);

  const open = Boolean(
    session && (!session.profileComplete || (phase === 'success' && !dismissed))
  );

  useEffect(() => {
    if (!open) return;
    document.body.classList.add('overflow-hidden');
    return () => document.body.classList.remove('overflow-hidden');
  }, [open]);

  const form = useForm<JobSeekerOnboardingForm>({
    defaultValues: {
      fullName: session?.candidate?.fullName ?? '',
      preferredRole: session?.candidate?.preferredRole ?? '',
      city: session?.candidate?.city?.trim() || location || '',
      mobile: session?.phone ?? '',
      area: session?.candidate?.area ?? '',
      workExperience: session?.candidate?.workExperience ?? ''
    },
    mode: 'onSubmit'
  });

  if (!session || !open) return null;

  function onComplete(candidate: JobSeekerCandidateProfile) {
    completeOnboarding(candidate);
    setSaved(candidate);
    setPhase('success');
  }

  function onCloseModal() {
    clearSession();
    navigate('/');
  }

  return (
    <Dialog
      open={open}
      bare
      dismissible={false}
      onClose={() => {
        /* Escape blocked; use ✕ to leave. */
      }}
      title={phase === 'form' ? 'Complete Your Profile' : "You're all set"}
      className="m-0 size-full max-h-none max-w-none overflow-y-auto bg-transparent p-0 text-ink backdrop:bg-ink/50 backdrop:blur-[6px] open:animate-dlg-in motion-reduce:animate-none"
    >
      <div className="flex min-h-full items-center justify-center p-3 sm:p-5">
        <div
          className={cn(
            'relative grid w-full max-w-[920px] items-stretch overflow-hidden rounded-2xl bg-surface shadow-dialog',
            'min-[880px]:h-[min(620px,calc(100dvh-1.5rem))] min-[880px]:grid-cols-[minmax(0,1fr)_minmax(0,1.63fr)]',
            'animate-dlg-in motion-reduce:animate-none'
          )}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={onCloseModal}
            className="absolute top-3 right-3 z-20 grid size-8 place-items-center rounded-full text-ink-500 transition-colors hover:bg-muted hover:text-ink"
          >
            <X className="size-[18px]" strokeWidth={2.2} />
          </button>

          <aside className="flex min-h-0 flex-col self-stretch rounded-t-2xl border-b border-line bg-[#FFF7F2] px-8 pt-8 pb-7 min-[880px]:h-full min-[880px]:rounded-l-2xl min-[880px]:rounded-tr-none min-[880px]:border-r min-[880px]:border-b-0">
            <div className="min-w-0 shrink-0">
              <p className="text-[11px] font-extrabold tracking-[0.14em] text-brand-600 uppercase">
                {phase === 'form' ? "Built for India's food industry" : 'Profile complete'}
              </p>
              <h2 // guard-allow: onboarding overlay matches public hire modal, not console PageHeader
                className="mt-2.5 max-w-[12ch] text-[26px] leading-[1.15] font-extrabold tracking-[-0.03em] text-ink min-[880px]:text-[30px]"
              >
                {phase === 'form' ? 'Complete Your Profile' : "You're all set!"}
              </h2>
              <p className="mt-2.5 max-w-[240px] text-[13.5px] leading-snug font-medium text-ink-500">
                {phase === 'form'
                  ? 'A few details help us match you with the right jobs.'
                  : 'Your profile is ready. Start exploring jobs near you.'}
              </p>
              <span
                className="mt-4 block h-[3px] w-10 rounded-full bg-brand-600"
                aria-hidden="true"
              />
            </div>
            {/* Fills leftover left-column height so the chef sits under the copy like the reference — no empty mid-band. */}
            <div className="mt-6 flex min-h-0 flex-1 items-center justify-center min-[880px]:justify-start">
              <div className="aspect-square w-[min(100%,236px)] overflow-hidden rounded-full bg-[#FFE4D6] shadow-sm ring-[3px] ring-[#FFD0BC]">
                <img
                  src={chefIllustration}
                  alt=""
                  className="size-full object-cover object-center"
                  decoding="async"
                />
              </div>
            </div>
          </aside>

          <div className="relative min-h-0 self-stretch overflow-y-auto p-8 pt-9 min-[880px]:h-full min-[880px]:pr-9">
            {phase === 'form' ? (
              <JobSeekerOnboardingFormFields
                register={form.register}
                handleSubmit={form.handleSubmit}
                setValue={form.setValue}
                setError={form.setError}
                clearErrors={form.clearErrors}
                getValues={form.getValues}
                errors={form.formState.errors}
                initialRole={session.candidate?.preferredRole ?? ''}
                initialCity={session.candidate?.city?.trim() || location || ''}
                initialArea={session.candidate?.area ?? ''}
                initialExperience={session.candidate?.workExperience ?? ''}
                cityLocked={cityLocked}
                onCityLockedChange={setCityLocked}
                onSelectLocation={selectLocation}
                onComplete={onComplete}
              />
            ) : (
              <div className="flex flex-col gap-5 pt-1">
                <ul
                  aria-label="Saved profile summary"
                  className="space-y-3 rounded-2xl border border-line bg-canvas p-4"
                >
                  <li className="flex items-center gap-3 text-[14px] font-semibold text-ink">
                    <User className="size-4 text-brand-600" aria-hidden="true" />
                    {saved?.fullName ?? session.profile.displayName}
                  </li>
                  <li className="flex items-center gap-3 text-[14px] font-semibold text-ink">
                    <Briefcase className="size-4 text-brand-600" aria-hidden="true" />
                    {saved?.preferredRole ?? session.candidate?.preferredRole}
                  </li>
                  <li className="flex items-center gap-3 text-[14px] font-semibold text-ink">
                    <MapPin className="size-4 text-brand-600" aria-hidden="true" />
                    {saved?.city ?? session.candidate?.city}
                  </li>
                </ul>
                <button
                  type="button"
                  onClick={() => setDismissed(true)}
                  className={cn(
                    homeButton('orange-base'),
                    'h-12 w-full justify-center text-[15px] font-extrabold'
                  )}
                >
                  Find Jobs →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
}
