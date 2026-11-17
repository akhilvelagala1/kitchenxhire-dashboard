import { Briefcase, CheckCircle2, ChefHat, IndianRupee, Info, MapPin } from 'lucide-react';
import type {
  FieldErrors,
  UseFormClearErrors,
  UseFormGetValues,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch
} from 'react-hook-form';
import { Input } from '@/shared/ui/Input';
import {
  PROFILE_CITY_OPTIONS,
  PROFILE_EXPERIENCE_OPTIONS,
  PROFILE_QUALIFICATION_OPTIONS,
  PROFILE_ROLE_OPTIONS,
  PROFILE_SALARY_OPTIONS
} from '../content/profileFormOptions';
import { jobSeekerFullNameSchema } from '../schemas/jobSeekerOnboarding';
import type {
  ProfileWizardFormValues,
  ProfileWizardStepId
} from '../schemas/jobSeekerProfileWizard';
import { ProfileIconSelect } from './ProfileIconSelect';
import { ProfileOptionWithOther } from './ProfileOptionWithOther';
import { ProfileSkillsStepFields } from './ProfileSkillsStepFields';
import { homeButton } from './styles';

interface ProfileWizardStepFieldsProps {
  step: ProfileWizardStepId;
  register: UseFormRegister<ProfileWizardFormValues>;
  errors: FieldErrors<ProfileWizardFormValues>;
  getValues: UseFormGetValues<ProfileWizardFormValues>;
  setValue: UseFormSetValue<ProfileWizardFormValues>;
  clearErrors: UseFormClearErrors<ProfileWizardFormValues>;
  setError: (
    name: keyof ProfileWizardFormValues,
    error: { type?: string; message: string }
  ) => void;
  watch: UseFormWatch<ProfileWizardFormValues>;
  onEditMobile?: () => void;
}

export function ProfileWizardStepFields({
  step,
  register,
  errors,
  getValues,
  setValue,
  clearErrors,
  setError,
  watch,
  onEditMobile
}: ProfileWizardStepFieldsProps) {
  const fullNameRegister = register('fullName');

  function validateFullNameBlur() {
    const parsed = jobSeekerFullNameSchema.safeParse(getValues('fullName') ?? '');
    if (parsed.success) {
      clearErrors('fullName');
      return;
    }
    setError('fullName', {
      type: 'manual',
      message: parsed.error.issues[0]?.message ?? 'Please enter a valid full name'
    });
  }

  if (step === 1) {
    return (
      <>
        <div className="mt-6 grid gap-5 min-[768px]:grid-cols-2 min-[768px]:gap-x-6 min-[768px]:gap-y-5">
          <div className="flex flex-col gap-2 min-[768px]:col-span-1">
            <label htmlFor="fullName" className="text-[14px] font-bold text-ink">
              Full Name
            </label>
            <Input
              id="fullName"
              {...fullNameRegister}
              onChange={(event) => {
                void fullNameRegister.onChange(event);
                if (errors.fullName) clearErrors('fullName');
              }}
              onBlur={(event) => {
                void fullNameRegister.onBlur(event);
                validateFullNameBlur();
              }}
              aria-invalid={Boolean(errors.fullName)}
              className="h-[52px] rounded-xl text-[14px] font-semibold"
            />
            {errors.fullName && (
              <p role="alert" className="text-[12px] font-medium text-danger-600">
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="mobile" className="text-[14px] font-bold text-ink">
                Mobile Number
              </label>
              {onEditMobile ? (
                <button
                  type="button"
                  onClick={onEditMobile}
                  className={homeButton('white-slim') + ' h-8 gap-1 px-2.5 text-[12px]'}
                >
                  Edit
                </button>
              ) : null}
            </div>
            <div className="relative">
              <Input
                id="mobile"
                readOnly
                {...register('mobile')}
                aria-invalid={Boolean(errors.mobile)}
                className="h-[52px] rounded-xl pr-28 text-[14px] font-semibold"
              />
              {(watch('mobile') ?? '').replace(/\D/g, '').length >= 10 ? (
                <span className="absolute top-1/2 right-3.5 inline-flex -translate-y-1/2 items-center gap-1 text-[13px] font-extrabold text-emerald-600">
                  <CheckCircle2 className="size-4" aria-hidden="true" />
                  Verified
                </span>
              ) : null}
            </div>
            {errors.mobile && (
              <p role="alert" className="text-[12px] font-medium text-danger-600">
                {errors.mobile.message}
              </p>
            )}
          </div>

          <ProfileOptionWithOther
            label="Current City / Location"
            icon={MapPin}
            name="city"
            value={watch('city')}
            onChange={(next) => {
              clearErrors('city');
              setValue('city', next, { shouldDirty: true });
            }}
            error={errors.city}
            options={PROFILE_CITY_OPTIONS}
            customPlaceholder="e.g. Vijayawada, Andhra Pradesh"
          />
          <ProfileOptionWithOther
            label="Preferred Job Role"
            icon={ChefHat}
            name="preferredRole"
            value={watch('preferredRole')}
            onChange={(next) => {
              clearErrors('preferredRole');
              setValue('preferredRole', next, { shouldDirty: true });
            }}
            error={errors.preferredRole}
            options={PROFILE_ROLE_OPTIONS}
            customPlaceholder="e.g. Italian Chef"
          />
          <ProfileIconSelect
            label="Work Experience"
            icon={Briefcase}
            name="workExperience"
            value={watch('workExperience')}
            onChange={(next) => {
              clearErrors('workExperience');
              setValue('workExperience', next, { shouldDirty: true });
            }}
            error={errors.workExperience}
            options={PROFILE_EXPERIENCE_OPTIONS}
          />
          <ProfileOptionWithOther
            label="Expected Salary (per month)"
            icon={IndianRupee}
            name="expectedSalary"
            value={watch('expectedSalary')}
            onChange={(next) => {
              clearErrors('expectedSalary');
              setValue('expectedSalary', next, { shouldDirty: true });
            }}
            error={errors.expectedSalary}
            options={PROFILE_SALARY_OPTIONS}
            mode="salary"
            customPlaceholder="e.g. 80000"
          />
        </div>
        <div className="mt-5 flex gap-3 rounded-xl bg-[#FFF3ED] px-4 py-3.5 text-[14px] font-semibold leading-snug text-ink-600">
          <Info className="size-5 shrink-0 text-brand-600" aria-hidden="true" />
          <p>
            You can update or add more details (skills, education, resume and documents) in the next
            steps.
          </p>
        </div>
      </>
    );
  }

  if (step === 2) {
    return (
      <ProfileSkillsStepFields
        register={register}
        errors={errors}
        setValue={setValue}
        clearErrors={clearErrors}
        watch={watch}
      />
    );
  }

  if (step === 3) {
    return (
      <div className="mt-5 grid gap-4 min-[768px]:grid-cols-2">
        <ProfileIconSelect
          label="Highest qualification"
          icon={Briefcase}
          name="highestQualification"
          value={watch('highestQualification')}
          onChange={(next) =>
            setValue('highestQualification', next, { shouldDirty: true, shouldValidate: true })
          }
          error={errors.highestQualification}
          options={PROFILE_QUALIFICATION_OPTIONS}
        />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="institution" className="text-[13px] font-bold text-ink">
            School / institution (optional)
          </label>
          <Input
            id="institution"
            {...register('institution')}
            className="h-12 rounded-xl text-[14px] font-semibold"
          />
        </div>
      </div>
    );
  }

  return (
    <dl className="mt-5 grid gap-3 text-[14px] font-semibold text-ink-600 min-[768px]:grid-cols-2">
      {(Object.keys(getValues()) as (keyof ProfileWizardFormValues)[]).map((key) => (
        <div key={key} className="rounded-xl bg-muted px-3 py-2.5">
          <dt className="text-[11px] font-extrabold uppercase tracking-wide text-ink-500">
            {key.replace(/([A-Z])/g, ' $1')}
          </dt>
          <dd className="mt-1 text-ink">{getValues(key) || '—'}</dd>
        </div>
      ))}
    </dl>
  );
}
