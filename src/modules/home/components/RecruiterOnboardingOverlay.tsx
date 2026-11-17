import { X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { cn } from '@/shared/lib/cn';
import { Dialog } from '@/shared/ui/Dialog';
import recruiterIllustration from '../assets/recruiter-onboarding-illustration.svg';
import { normalizeRecruiterAccountId } from '../lib/recruiterAccount';
import { getRecruiterProfile, isRecruiterProfileComplete } from '../lib/recruiterOnboarding';
import { readRecruiterOrganisationRecord } from '../lib/recruiterOrganisationStorage';
import { useRecruiterSession } from '../lib/recruiterSession';
import type { RecruiterOnboardingForm as RecruiterOnboardingValues } from '../schemas/recruiterOnboarding';
import { RecruiterOnboardingForm } from './RecruiterOnboardingForm';

const EMPTY_VALUES: RecruiterOnboardingValues = {
  fullName: '',
  mobile: '',
  businessName: '',
  businessType: '',
  recruiterRole: '',
  city: '',
  area: '',
  email: ''
};

/**
 * Post-OTP recruiter onboarding: the dashboard stays visible behind a split modal.
 * Saves the recruiter's own details, and seeds the organisation draft with the business basics.
 */
export function RecruiterOnboardingOverlay() {
  const navigate = useNavigate();
  const { session, clearSession } = useRecruiterSession();
  const [completed, setCompleted] = useState(() =>
    session ? isRecruiterProfileComplete(normalizeRecruiterAccountId(session.phone)) : false
  );

  const initial = useMemo<RecruiterOnboardingValues>(() => {
    if (!session) return EMPTY_VALUES;
    const accountId = normalizeRecruiterAccountId(session.phone);
    const saved = getRecruiterProfile(accountId);
    const organisation = readRecruiterOrganisationRecord(accountId);
    const draft = organisation.draft ?? organisation.organisation;
    return {
      fullName: saved?.fullName ?? '',
      mobile: session.phone,
      businessName: saved?.businessName ?? draft?.name ?? '',
      businessType: saved?.businessType ?? draft?.businessType ?? '',
      recruiterRole: saved?.recruiterRole ?? '',
      city: saved?.city ?? draft?.city ?? '',
      area: saved?.area ?? '',
      email: saved?.email ?? ''
    };
  }, [session]);

  const open = Boolean(session) && !completed;

  useEffect(() => {
    if (!open) return;
    document.body.classList.add('overflow-hidden');
    return () => document.body.classList.remove('overflow-hidden');
  }, [open]);

  if (!session) return null;

  function logoutAndLeave() {
    clearSession();
    navigate('/');
  }

  return (
    <Dialog
      open={open}
      bare
      dismissible={false}
      onClose={() => {
        /* Escape blocked; ✕ logs out instead of skipping onboarding. */
      }}
      title="Complete Your Recruiter Profile"
      className="m-0 size-full max-h-none max-w-none overflow-y-auto bg-transparent p-0 text-ink backdrop:bg-ink/50 backdrop:blur-[6px] open:animate-dlg-in motion-reduce:animate-none"
    >
      <div className="flex min-h-full items-center justify-center p-3 sm:p-6">
        <div
          className={cn(
            'relative grid w-full max-w-[1024px] items-stretch overflow-hidden rounded-[24px] bg-surface shadow-dialog',
            'min-[900px]:h-[min(676px,calc(100dvh-2rem))] min-[900px]:grid-cols-[minmax(0,369fr)_minmax(0,655fr)]',
            'animate-dlg-in motion-reduce:animate-none'
          )}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={logoutAndLeave}
            className="absolute top-4 right-4 z-20 grid size-9 place-items-center rounded-full text-ink-500 transition-colors hover:bg-muted hover:text-ink min-[900px]:top-6 min-[900px]:right-6"
          >
            <X className="size-[19px]" strokeWidth={2.2} />
          </button>

          <aside className="flex min-h-0 flex-col rounded-t-[24px] border-b border-line bg-brand-50 px-6 pt-6 pb-6 min-[640px]:flex-row min-[640px]:items-center min-[640px]:gap-8 min-[640px]:px-8 min-[640px]:pt-8 min-[640px]:pb-8 min-[900px]:h-full min-[900px]:flex-col min-[900px]:items-stretch min-[900px]:gap-0 min-[900px]:rounded-l-[24px] min-[900px]:rounded-tr-none min-[900px]:border-r min-[900px]:border-b-0 min-[900px]:px-12 min-[900px]:pt-12 min-[900px]:pb-10">
            <div className="min-w-0 shrink-0">
              <p className="text-[11px] font-extrabold tracking-[0.14em] text-brand-600 uppercase">
                Built for India&apos;s food industry
              </p>
              <h2 className="mt-3 max-w-[13ch] text-[26px] leading-[1.12] font-extrabold tracking-[-0.03em] text-ink min-[900px]:text-[34px]">
                Complete Your Recruiter Profile
              </h2>
              <p className="mt-3 max-w-[250px] text-[13.5px] leading-snug font-medium text-ink-500 min-[900px]:text-[14px]">
                Add a few details about your business to start hiring the right people.
              </p>
              <span
                className="mt-4 block h-[3px] w-10 rounded-full bg-brand-600 min-[900px]:mt-5"
                aria-hidden="true"
              />
            </div>
            <div className="mt-4 flex min-h-0 flex-1 items-center justify-center min-[640px]:mt-0 min-[640px]:w-[168px] min-[640px]:flex-none min-[900px]:mt-5 min-[900px]:w-auto min-[900px]:flex-1">
              <img
                src={recruiterIllustration}
                alt="Recruiter working on a laptop"
                className="h-auto max-h-full w-[168px] object-contain min-[900px]:w-[300px]"
                decoding="async"
              />
            </div>
          </aside>

          <div className="min-h-0 bg-surface px-6 py-6 min-[900px]:overflow-y-auto min-[900px]:px-8 min-[900px]:pt-14 min-[900px]:pb-8">
            <RecruiterOnboardingForm
              accountId={normalizeRecruiterAccountId(session.phone)}
              mobile={session.phone}
              initial={initial}
              onSaved={() => setCompleted(true)}
            />
          </div>
        </div>
      </div>
    </Dialog>
  );
}
