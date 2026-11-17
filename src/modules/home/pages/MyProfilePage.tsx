import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import { AuthDialog } from '../components/AuthDialog';
import { ProfileBenefitsPanel } from '../components/ProfileBenefitsPanel';
import { ProfileSavedSummary } from '../components/ProfileSavedSummary';
import { ProfileStepBanner } from '../components/ProfileStepBanner';
import { ProfileStepIndicator } from '../components/ProfileStepIndicator';
import { ProfileWizardStepFields } from '../components/ProfileWizardStepFields';
import { card, homeButton, secLead, secTitle } from '../components/styles';
import { popoverBoundaryProps } from '../components/useAnchoredPopover';
import { cn } from '@/shared/lib/cn';
import { useJobSeekerSession, type JobSeekerSessionState } from '../lib/jobSeekerSession';
import { readProfileDraft, writeProfileDraft } from '../lib/profileDraftStorage';
import { buildProfileWizardDefaults } from '../lib/profileWizardDefaults';
import {
  focusFirstProfileBasicInvalid,
  focusFirstProfileSkillsInvalid
} from '../lib/profileWizardFocus';
import {
  basicDetailsSchema,
  educationSchema,
  PROFILE_BASIC_FIELD_ORDER,
  PROFILE_SKILLS_FIELD_ORDER,
  profileWizardSchema,
  skillsExperienceSchema,
  type ProfileBasicDetailsField,
  type ProfileSkillsField,
  type ProfileWizardFormValues,
  type ProfileWizardStepId
} from '../schemas/jobSeekerProfileWizard';

function stepSchema(step: ProfileWizardStepId) {
  if (step === 1) return basicDetailsSchema;
  if (step === 2) return skillsExperienceSchema;
  if (step === 3) return educationSchema;
  return profileWizardSchema;
}

const STEP_TITLES: Record<ProfileWizardStepId, { title: string; lead: string }> = {
  1: { title: 'Basic Details', lead: 'Tell us a little about yourself' },
  2: { title: 'Skills & Experience', lead: 'Share what you are good at in the kitchen' },
  3: { title: 'Education', lead: 'Add your highest qualification' },
  4: { title: 'Review & Save', lead: 'Confirm everything before you save' }
};

export function MyProfilePage() {
  const { session } = useJobSeekerSession();
  return <ProfileWizard key={session?.phone ?? ''} session={session} />;
}

function ProfileWizard({ session }: { session: JobSeekerSessionState | null }) {
  const navigate = useNavigate();
  const { setVerifiedPhone } = useJobSeekerSession();
  const phone = session?.phone ?? '';
  const stored = readProfileDraft(phone);
  const defaults = buildProfileWizardDefaults(session);

  const [step, setStep] = useState<ProfileWizardStepId>(stored?.step ?? 1);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [completed, setCompleted] = useState(stored?.completed === true);
  const [mobileAuthOpen, setMobileAuthOpen] = useState(false);

  const form = useForm<ProfileWizardFormValues>({
    defaultValues: stored?.values ?? defaults,
    mode: 'onSubmit'
  });

  const { register, handleSubmit, getValues, setError, setValue, watch, formState, clearErrors } =
    form;

  function persist(
    nextStep: ProfileWizardStepId,
    values: ProfileWizardFormValues,
    nextCompleted = completed
  ) {
    writeProfileDraft({ step: nextStep, values, completed: nextCompleted }, phone);
  }

  function onSelectStep(next: ProfileWizardStepId) {
    if (completed) return;
    persist(next, getValues());
    clearErrors();
    setSavedMessage(null);
    setStep(next);
  }

  function onValid(values: ProfileWizardFormValues) {
    const parsed = stepSchema(step).safeParse(values);
    if (!parsed.success) {
      const invalidBasic = new Set<ProfileBasicDetailsField>();
      const invalidSkills = new Set<ProfileSkillsField>();
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (typeof field === 'string') {
          setError(field as keyof ProfileWizardFormValues, { message: issue.message });
          if (PROFILE_BASIC_FIELD_ORDER.includes(field as ProfileBasicDetailsField)) {
            invalidBasic.add(field as ProfileBasicDetailsField);
          }
          if (PROFILE_SKILLS_FIELD_ORDER.includes(field as ProfileSkillsField)) {
            invalidSkills.add(field as ProfileSkillsField);
          }
        }
      });
      if (step === 1) {
        focusFirstProfileBasicInvalid([...invalidBasic]);
      } else if (step === 2) {
        focusFirstProfileSkillsInvalid([...invalidSkills]);
      }
      return;
    }

    clearErrors();
    if (step < 4) {
      const next = (step + 1) as ProfileWizardStepId;
      persist(next, values);
      setStep(next);
      return;
    }
    setCompleted(true);
    persist(4, values, true);
    setSavedMessage('Profile saved. Employers can now discover you for matching roles.');
  }

  function onCancel() {
    if (step === 1) {
      navigate('/user');
      return;
    }
    const prev = (step - 1) as ProfileWizardStepId;
    persist(prev, getValues());
    clearErrors();
    setStep(prev);
  }

  function onEditProfile() {
    setCompleted(false);
    setSavedMessage(null);
    persist(1, getValues(), false);
    setStep(1);
  }

  const intro = (
    <>
      <h1 // guard-allow: job seeker profile wizard matches prototype, not console PageHeader
        className={secTitle}
      >
        {completed ? 'Your Profile' : 'Create Your Profile'}
      </h1>
      <p className={cn(secLead, 'max-w-[640px]')}>
        {completed
          ? 'Review your saved details or edit them anytime.'
          : 'A simple profile helps employers find and contact you for the right jobs.'}
      </p>
    </>
  );

  return (
    <>
      <title>KitchenX Hiring | My Profile</title>
      <div className="grid grid-cols-1 gap-4 min-[1280px]:grid-cols-[minmax(0,1fr)_308px] min-[1280px]:items-stretch min-[1280px]:gap-6">
        <div className="flex min-w-0 flex-col gap-4">
          {intro}
          {completed ? null : <ProfileStepIndicator current={step} onSelect={onSelectStep} />}
          {completed ? (
            <div
              className={cn(
                card,
                'flex w-full min-h-0 flex-col border border-line p-6 hover:translate-y-0 hover:shadow-card min-[768px]:p-7 min-[1280px]:p-8 motion-reduce:hover:translate-y-0'
              )}
            >
              <header className="border-b border-line pb-5">
                <h2 className="text-[20px] font-extrabold tracking-tight text-ink">
                  Saved profile
                </h2>
                <p className="mt-1.5 text-[14.5px] font-medium text-ink-500">
                  Your details are ready for employers to find you.
                </p>
              </header>
              <ProfileSavedSummary values={getValues()} onEdit={onEditProfile} />
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(onValid)}
              {...popoverBoundaryProps}
              className={cn(
                card,
                'flex w-full min-h-0 flex-col border border-line p-6 hover:translate-y-0 hover:shadow-card min-[768px]:p-7 min-[1280px]:p-8 motion-reduce:hover:translate-y-0'
              )}
            >
              <header className={step === 2 ? undefined : 'border-b border-line pb-5'}>
                {step === 2 ? (
                  <ProfileStepBanner
                    title={STEP_TITLES[2].title}
                    lead={`${STEP_TITLES[2].lead}.`}
                  />
                ) : (
                  <>
                    <h2 className="text-[20px] font-extrabold tracking-tight text-ink">
                      {STEP_TITLES[step].title}
                    </h2>
                    <p className="mt-1.5 text-[14.5px] font-medium text-ink-500">
                      {STEP_TITLES[step].lead}
                    </p>
                  </>
                )}
              </header>

              <ProfileWizardStepFields
                step={step}
                register={register}
                errors={formState.errors}
                getValues={getValues}
                setValue={setValue}
                clearErrors={clearErrors}
                setError={setError}
                watch={watch}
                onEditMobile={() => setMobileAuthOpen(true)}
              />

              {savedMessage && step === 4 && (
                <p className="mt-4 rounded-xl bg-emerald-50 px-3 py-2.5 text-[13px] font-bold text-emerald-700">
                  {savedMessage}
                </p>
              )}

              <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5 min-[1280px]:mt-auto">
                <button type="button" onClick={onCancel} className={homeButton('white-base')}>
                  {step === 1 ? 'Cancel' : 'Back'}
                </button>
                <button type="submit" className={homeButton('orange-base')}>
                  {step === 4 ? 'Save Profile' : 'Save & Continue →'}
                </button>
              </div>
            </form>
          )}

          <p className="mt-4 text-center text-[12px] font-medium text-ink-500 min-[1280px]:hidden">
            <Link to="/user/applications" className="font-bold text-brand-600 hover:underline">
              View my applications
            </Link>
          </p>
        </div>
        <div className="min-w-0">
          <ProfileBenefitsPanel stretch />
        </div>
      </div>

      <AuthDialog
        open={mobileAuthOpen}
        onClose={() => setMobileAuthOpen(false)}
        onVerified={({ phone: verified }) => {
          setVerifiedPhone(verified);
          setValue('mobile', verified, { shouldDirty: true });
          clearErrors('mobile');
          setMobileAuthOpen(false);
        }}
      />
    </>
  );
}
