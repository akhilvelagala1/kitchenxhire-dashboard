import { Briefcase, CalendarDays, CheckCircle2, MapPin, Phone, User } from 'lucide-react';
import { useMemo, useState } from 'react';
import type {
  FieldErrors,
  UseFormClearErrors,
  UseFormGetValues,
  UseFormHandleSubmit,
  UseFormRegister,
  UseFormSetError,
  UseFormSetValue
} from 'react-hook-form';
import { cn } from '@/shared/lib/cn';
import { Input } from '@/shared/ui/Input';
import { CITIES } from '../content/nav';
import {
  PROFILE_AREA_OPTIONS_BY_CITY,
  PROFILE_EXPERIENCE_OPTIONS
} from '../content/profileFormOptions';
import {
  candidateFieldFromIssuePath,
  jobSeekerCandidateSchema,
  jobSeekerFullNameSchema,
  type JobSeekerCandidateProfile,
  type JobSeekerOnboardingField,
  type JobSeekerOnboardingForm
} from '../schemas/jobSeekerOnboarding';
import {
  focusFirstOnboardingInvalid,
  ONBOARDING_CATEGORY_SELECT_OPTIONS
} from './jobSeekerOnboardingFormHelpers';
import { ProfileIconSelect } from './ProfileIconSelect';
import { homeButton } from './styles';

const CITY_OPTIONS = CITIES.map((city) => ({ value: city, label: city }));

export interface JobSeekerOnboardingFormProps {
  register: UseFormRegister<JobSeekerOnboardingForm>;
  handleSubmit: UseFormHandleSubmit<JobSeekerOnboardingForm>;
  setValue: UseFormSetValue<JobSeekerOnboardingForm>;
  setError: UseFormSetError<JobSeekerOnboardingForm>;
  clearErrors: UseFormClearErrors<JobSeekerOnboardingForm>;
  getValues: UseFormGetValues<JobSeekerOnboardingForm>;
  errors: FieldErrors<JobSeekerOnboardingForm>;
  initialRole: string;
  initialCity: string;
  initialArea: string;
  initialExperience: string;
  cityLocked: boolean;
  onCityLockedChange: (locked: boolean) => void;
  onSelectLocation: (city: string) => void;
  onComplete: (candidate: JobSeekerCandidateProfile) => void;
}

export function JobSeekerOnboardingFormFields({
  register,
  handleSubmit,
  setValue,
  setError,
  clearErrors,
  getValues,
  errors,
  initialRole,
  initialCity,
  initialArea,
  initialExperience,
  cityLocked,
  onCityLockedChange,
  onSelectLocation,
  onComplete
}: JobSeekerOnboardingFormProps) {
  const [preferredRole, setPreferredRole] = useState(initialRole);
  const [cityValue, setCityValue] = useState(initialCity);
  const [area, setArea] = useState(initialArea);
  const [workExperience, setWorkExperience] = useState(initialExperience);

  const areaOptions = useMemo(() => PROFILE_AREA_OPTIONS_BY_CITY[cityValue] ?? [], [cityValue]);
  const fullNameRegister = register('fullName');

  function validateFullNameBlur() {
    const parsed = jobSeekerFullNameSchema.safeParse(getValues('fullName') ?? '');
    if (parsed.success) {
      clearErrors('fullName');
      return;
    }
    setError('fullName', {
      message: parsed.error.issues[0]?.message ?? 'Please enter a valid full name'
    });
  }

  function onSubmit(values: JobSeekerOnboardingForm) {
    const parsed = jobSeekerCandidateSchema.safeParse({
      fullName: values.fullName ?? '',
      preferredRole: preferredRole || values.preferredRole || '',
      city: cityValue || values.city || '',
      area: area || undefined,
      workExperience: workExperience || undefined
    });
    if (!parsed.success) {
      const invalid: JobSeekerOnboardingField[] = [];
      parsed.error.issues.forEach((issue) => {
        const field = candidateFieldFromIssuePath(issue.path[0]);
        if (!field || invalid.includes(field)) return;
        setError(field, { message: issue.message });
        invalid.push(field);
      });
      queueMicrotask(() => focusFirstOnboardingInvalid(invalid));
      return;
    }
    onSelectLocation(parsed.data.city);
    onComplete(parsed.data);
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="flex flex-col gap-1">
        <label htmlFor="onboarding-fullName" className="text-[13.5px] font-bold text-ink">
          Full Name <span className="text-brand-600">*</span>
        </label>
        <div className="relative">
          <User
            className="pointer-events-none absolute top-1/2 left-3.5 size-[17px] -translate-y-1/2 text-brand-600"
            aria-hidden="true"
          />
          <Input
            id="onboarding-fullName"
            placeholder="Enter your full name"
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
            className="h-[46px] rounded-xl border-line pl-11 text-[14px] font-semibold"
          />
        </div>
        {errors.fullName && (
          <p role="alert" className="text-[12px] text-danger-600">
            {errors.fullName.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="onboarding-mobile" className="text-[13.5px] font-bold text-ink">
          Mobile Number
        </label>
        <div className="relative">
          <Phone
            className="pointer-events-none absolute top-1/2 left-3.5 size-[17px] -translate-y-1/2 text-brand-600"
            aria-hidden="true"
          />
          <Input
            id="onboarding-mobile"
            readOnly
            {...register('mobile')}
            className="h-[46px] rounded-xl border-line bg-muted/30 pr-28 pl-11 text-[14px] font-semibold"
          />
          <span className="absolute top-1/2 right-3.5 inline-flex -translate-y-1/2 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[12px] font-extrabold text-emerald-700">
            <CheckCircle2 className="size-3.5" aria-hidden="true" />
            Verified
          </span>
        </div>
      </div>

      <ProfileIconSelect
        label="Job Category *"
        icon={Briefcase}
        name="preferredRole"
        value={preferredRole}
        onChange={(value) => {
          setPreferredRole(value);
          setValue('preferredRole', value, { shouldDirty: true });
          clearErrors('preferredRole');
        }}
        error={errors.preferredRole}
        options={ONBOARDING_CATEGORY_SELECT_OPTIONS}
        placeholder="Select job category"
        compact
      />

      {cityLocked && (cityValue || getValues('city')) ? (
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[13.5px] font-bold text-ink">
              City / Location <span className="text-brand-600">*</span>
            </span>
            <button
              type="button"
              className="text-[13px] font-extrabold text-brand-600 hover:underline"
              onClick={() => onCityLockedChange(false)}
            >
              Change
            </button>
          </div>
          <div
            className="relative flex h-[46px] items-center rounded-xl border border-line bg-muted/30 pr-28 pl-11 text-[14px] font-semibold text-ink"
            data-testid="onboarding-location-autofill"
          >
            <MapPin
              className="absolute top-1/2 left-3.5 size-[17px] -translate-y-1/2 text-brand-600"
              aria-hidden="true"
            />
            {cityValue || getValues('city')}
            <span className="absolute top-1/2 right-3.5 inline-flex -translate-y-1/2 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[12px] font-extrabold text-emerald-700">
              <CheckCircle2 className="size-3.5" aria-hidden="true" />
              Auto-filled
            </span>
          </div>
        </div>
      ) : (
        <ProfileIconSelect
          label="City / Location *"
          icon={MapPin}
          name="city"
          value={cityValue}
          onChange={(value) => {
            setCityValue(value);
            setValue('city', value, { shouldDirty: true });
            clearErrors('city');
            onSelectLocation(value);
            setArea('');
            setValue('area', '');
            onCityLockedChange(true);
          }}
          error={errors.city}
          options={CITY_OPTIONS}
          placeholder="Select your city"
          compact
        />
      )}

      <ProfileIconSelect
        label="Area (Optional)"
        icon={MapPin}
        name="area"
        value={area}
        onChange={(value) => {
          setArea(value);
          setValue('area', value, { shouldDirty: true });
        }}
        options={
          areaOptions.length > 0 ? areaOptions : [{ value: 'Other', label: 'Other / Nearby area' }]
        }
        placeholder="Select area"
        compact
      />

      <ProfileIconSelect
        label="Work Experience (Optional)"
        icon={CalendarDays}
        name="workExperience"
        value={workExperience}
        onChange={(value) => {
          setWorkExperience(value);
          setValue('workExperience', value, { shouldDirty: true });
        }}
        options={PROFILE_EXPERIENCE_OPTIONS}
        placeholder="Select experience"
        compact
      />

      <button
        type="submit"
        className={cn(
          homeButton('orange-base'),
          'mt-0.5 h-12 w-full justify-center text-[15px] font-extrabold'
        )}
      >
        Complete Profile →
      </button>
    </form>
  );
}
