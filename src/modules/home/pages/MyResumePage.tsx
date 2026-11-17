import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { ResumeBuilderActions } from '../components/ResumeBuilderActions';
import { ResumeBuilderShell } from '../components/ResumeBuilderShell';
import { ResumeStepIndicator } from '../components/ResumeStepIndicator';
import { ResumeWizardStepFields } from '../components/ResumeWizardStepFields';
import {
  homeButton,
  resumeCardHeading,
  resumeCardLead,
  resumeFormCard,
  secLead,
  secTitle
} from '../components/styles';
import { cn } from '@/shared/lib/cn';
import { firstIncompleteResumeStep } from '../lib/resumeCompletion';
import { applyResumeDerivedContent } from '../lib/resumeSuggestions';
import { useJobSeekerSession, type JobSeekerSessionState } from '../lib/jobSeekerSession';
import {
  clearResumeDraft,
  readResumeDraft,
  writeResumeDraft,
  type ResumeMeta
} from '../lib/resumeDraftStorage';
import { buildResumeWizardDefaults } from '../lib/resumeWizardDefaults';
import {
  educationSkillsStepSchema,
  personalDetailsSchema,
  workExperienceStepSchema,
  type ResumeWizardFormValues,
  type ResumeWizardStepId
} from '../schemas/jobSeekerResumeWizard';

function stepSchema(step: ResumeWizardStepId) {
  if (step === 1) return personalDetailsSchema;
  if (step === 2) return educationSkillsStepSchema;
  return workExperienceStepSchema;
}

const STEP_TITLES: Record<ResumeWizardStepId, { title: string; lead: string }> = {
  1: { title: 'Personal Details', lead: "Let's start with your basic information." },
  2: { title: 'Education & Skills', lead: 'Pick your qualification, languages, and skills' },
  3: { title: 'Work Experience', lead: 'Tell employers where you have worked' }
};

export function MyResumePage() {
  const { session } = useJobSeekerSession();
  return <ResumeWizard key={session?.phone ?? ''} session={session} />;
}

function ResumeWizard({ session }: { session: JobSeekerSessionState | null }) {
  const navigate = useNavigate();
  const phone = session?.phone ?? '';
  const stored = readResumeDraft(phone);
  const defaults = buildResumeWizardDefaults(session);

  const [step, setStep] = useState<ResumeWizardStepId>(stored?.step ?? 1);
  const [meta, setMeta] = useState<ResumeMeta>(stored?.meta ?? {});

  const form = useForm<ResumeWizardFormValues>({
    defaultValues: stored?.values ?? defaults,
    mode: 'onSubmit'
  });

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setError,
    control,
    setValue,
    watch,
    formState,
    clearErrors
  } = form;

  const photoDataUrl = useWatch({ control, name: 'photoDataUrl' });

  useEffect(() => {
    register('languages');
    register('skills');
    register('qualification');
    register('gender');
    register('city');
    register('photoDataUrl');
    register('workHistory.0.employmentType');
    register('workHistory.0.yearsOfExperience');
  }, [register]);

  function persist(nextStep: ResumeWizardStepId, values: ResumeWizardFormValues, nextMeta = meta) {
    const nextValues = applyResumeDerivedContent(values);
    writeResumeDraft({ step: nextStep, values: nextValues, meta: nextMeta }, phone);
    setMeta(nextMeta);
    return nextValues;
  }

  function applyStepErrors(nextStep: ResumeWizardStepId, values: ResumeWizardFormValues) {
    const parsed = stepSchema(nextStep).safeParse(values);
    if (parsed.success) return false;
    parsed.error.issues.forEach((issue) => {
      const field = issue.path[0];
      if (typeof field === 'string') {
        setError(field as keyof ResumeWizardFormValues, { message: issue.message });
      }
    });
    return true;
  }

  function onSelectStep(next: ResumeWizardStepId) {
    persist(next, getValues());
    clearErrors();
    setStep(next);
  }

  function onValid(values: ResumeWizardFormValues) {
    if (step < 3) {
      if (applyStepErrors(step, values)) return;
      const next = (step + 1) as ResumeWizardStepId;
      persist(next, values);
      setStep(next);
      return;
    }

    const ready = persist(3, values);
    const incomplete = firstIncompleteResumeStep(ready);
    if (incomplete) {
      setStep(incomplete);
      applyStepErrors(incomplete, values);
      return;
    }
    navigate('/user/resume/preview');
  }

  function onCancel() {
    if (step === 1) {
      navigate('/user');
      return;
    }
    const prev = (step - 1) as ResumeWizardStepId;
    persist(prev, getValues());
    clearErrors();
    setStep(prev);
  }

  function onCreateNew() {
    if (!window.confirm('Start a new resume? Unsaved builder changes will be cleared.')) return;
    clearResumeDraft();
    const fresh = buildResumeWizardDefaults(session);
    reset({ ...fresh, photoDataUrl: '' });
    setStep(1);
    setMeta({});
  }

  function onUpload(file: File) {
    if (
      meta.uploadedFileName &&
      !window.confirm('Replace the uploaded resume file with this new upload?')
    ) {
      return;
    }
    const nextMeta: ResumeMeta = {
      uploadedFileName: file.name,
      uploadedAt: new Date().toISOString()
    };
    setMeta(nextMeta);
    persist(step, getValues(), nextMeta);
  }

  const header = (
    <div className="flex flex-col gap-2 min-[900px]:flex-row min-[900px]:items-start min-[900px]:justify-between min-[900px]:gap-5">
      <div>
        <h1 // guard-allow: job seeker resume builder matches prototype, not console PageHeader
          className={secTitle}
        >
          Build My Resume
        </h1>
        <p className={cn(secLead, 'max-w-[560px]')}>
          Create a simple, professional resume with your details. No resume? No problem!
        </p>
        {meta.uploadedFileName ? (
          <p className="mt-2 text-[13px] font-semibold text-ink-600">
            Uploaded file on record:{' '}
            <span className="font-bold text-ink">{meta.uploadedFileName}</span>
          </p>
        ) : null}
      </div>
      <ResumeBuilderActions
        onCreateNew={onCreateNew}
        onUpload={onUpload}
        className="min-[900px]:shrink-0 min-[900px]:pt-2"
      />
    </div>
  );

  return (
    <>
      <title>KitchenX Hiring | My Resume</title>
      <ResumeBuilderShell
        header={header}
        stepper={<ResumeStepIndicator current={step} onSelect={onSelectStep} />}
      >
        <form
          onSubmit={handleSubmit(() => onValid(getValues()))}
          className={cn(
            resumeFormCard,
            'flex w-full flex-col hover:translate-y-0 motion-reduce:hover:translate-y-0'
          )}
        >
          <header className="border-b border-line pb-3">
            <h2 className={resumeCardHeading}>{STEP_TITLES[step].title}</h2>
            <p className={resumeCardLead}>{STEP_TITLES[step].lead}</p>
          </header>

          <ResumeWizardStepFields
            step={step}
            register={register}
            control={control}
            errors={formState.errors}
            setValue={setValue}
            clearErrors={clearErrors}
            watch={watch}
            photoDataUrl={photoDataUrl}
          />

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
            <button type="button" onClick={onCancel} className={homeButton('white-base')}>
              {step === 1 ? 'Cancel' : 'Back'}
            </button>
            <button type="submit" className={homeButton('orange-base')}>
              {step === 3 ? 'Save & Preview' : 'Save & Continue →'}
            </button>
          </div>
        </form>
      </ResumeBuilderShell>
    </>
  );
}
