import {
  Briefcase,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  Store,
  User,
  UtensilsCrossed
} from 'lucide-react';
import { useState } from 'react';
import { useForm, type FieldError } from 'react-hook-form';
import { cn } from '@/shared/lib/cn';
import { Input } from '@/shared/ui/Input';
import {
  RECRUITER_BUSINESS_TYPES,
  RECRUITER_ORG_CITY_OPTIONS,
  RECRUITER_ROLE_OPTIONS
} from '../content/recruiterOrgFormOptions';
import { PROFILE_AREA_OPTIONS_BY_CITY } from '../content/profileFormOptions';
import { saveRecruiterProfile } from '../lib/recruiterOnboarding';
import {
  recruiterFieldFromIssuePath,
  recruiterOnboardingSchema,
  type RecruiterOnboardingField,
  type RecruiterOnboardingForm
} from '../schemas/recruiterOnboarding';
import { ProfileIconSelect } from './ProfileIconSelect';
import { focusFirstInvalid } from './recruiterOnboardingFormHelpers';
import { homeButton } from './styles';

const BUSINESS_TYPE_OPTIONS = RECRUITER_BUSINESS_TYPES.map((option) => ({
  value: option.value,
  label: option.label
}));

const CITY_OPTIONS = RECRUITER_ORG_CITY_OPTIONS.map((city) => ({ value: city, label: city }));

const ROLE_OPTIONS = RECRUITER_ROLE_OPTIONS.map((option) => ({
  value: option.value,
  label: option.label
}));

/** Cities without a curated list still get a listbox, matching the reference's field shape. */
const AREA_FALLBACK_OPTIONS = [{ value: 'Other', label: 'Other / Nearby area' }] as const;

function FieldErrorText({ error }: { error?: FieldError }) {
  if (!error) return null;
  return (
    <p role="alert" className="text-[12px] font-medium text-danger-600">
      {error.message}
    </p>
  );
}

export interface RecruiterOnboardingFormProps {
  accountId: string;
  mobile: string;
  initial: RecruiterOnboardingForm;
  onSaved: () => void;
}

export function RecruiterOnboardingForm({
  accountId,
  mobile,
  initial,
  onSaved
}: RecruiterOnboardingFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors }
  } = useForm<RecruiterOnboardingForm>({
    defaultValues: initial,
    mode: 'onSubmit'
  });

  const [businessType, setBusinessType] = useState(initial.businessType);
  const [recruiterRole, setRecruiterRole] = useState(initial.recruiterRole);
  const [city, setCity] = useState(initial.city);
  const [area, setArea] = useState(initial.area);

  const areaOptions = PROFILE_AREA_OPTIONS_BY_CITY[city] ?? [];

  function onSubmit(values: RecruiterOnboardingForm) {
    const parsed = recruiterOnboardingSchema.safeParse({
      fullName: values.fullName ?? '',
      businessName: values.businessName ?? '',
      businessType: businessType || values.businessType || '',
      recruiterRole: recruiterRole || undefined,
      city: city || values.city || '',
      area: area || undefined,
      email: values.email || undefined
    });
    if (!parsed.success) {
      const invalid: RecruiterOnboardingField[] = [];
      parsed.error.issues.forEach((issue) => {
        const field = recruiterFieldFromIssuePath(issue.path[0]);
        if (!field || invalid.includes(field)) return;
        setError(field, { message: issue.message });
        invalid.push(field);
      });
      queueMicrotask(() => focusFirstInvalid(invalid));
      return;
    }
    saveRecruiterProfile(accountId, parsed.data);
    onSaved();
  }

  return (
    <form
      className="grid gap-x-6 gap-y-6 min-[640px]:grid-cols-2 min-[900px]:gap-y-7"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="recruiter-onboarding-fullName" className="text-[14px] font-bold text-ink">
          Full Name <span className="text-brand-600">*</span>
        </label>
        <div className="relative">
          <User
            className="pointer-events-none absolute top-1/2 left-3.5 size-[17px] -translate-y-1/2 text-brand-600"
            aria-hidden="true"
          />
          <Input
            id="recruiter-onboarding-fullName"
            placeholder="Enter your full name"
            {...register('fullName', { onChange: () => clearErrors('fullName') })}
            aria-invalid={Boolean(errors.fullName)}
            className="h-[50px] rounded-xl border-line pl-11 text-[14.5px] font-semibold"
          />
        </div>
        <FieldErrorText error={errors.fullName} />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="recruiter-onboarding-mobile" className="text-[14px] font-bold text-ink">
          Mobile Number <span className="text-brand-600">*</span>
        </label>
        <div className="relative">
          <Phone
            className="pointer-events-none absolute top-1/2 left-3.5 size-[17px] -translate-y-1/2 text-brand-600"
            aria-hidden="true"
          />
          <Input
            id="recruiter-onboarding-mobile"
            readOnly
            value={mobile}
            className="h-[50px] rounded-xl border-line bg-muted/30 pr-28 pl-11 text-[14.5px] font-semibold"
          />
          <span className="absolute top-1/2 right-3.5 inline-flex -translate-y-1/2 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[12px] font-extrabold text-emerald-700">
            <CheckCircle2 className="size-3.5" aria-hidden="true" />
            Verified
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1 min-[640px]:col-span-2">
        <label
          htmlFor="recruiter-onboarding-businessName"
          className="text-[14px] font-bold text-ink"
        >
          Business / Restaurant Name <span className="text-brand-600">*</span>
        </label>
        <div className="relative">
          <Store
            className="pointer-events-none absolute top-1/2 left-3.5 size-[17px] -translate-y-1/2 text-brand-600"
            aria-hidden="true"
          />
          <Input
            id="recruiter-onboarding-businessName"
            placeholder="Enter your business name"
            {...register('businessName', { onChange: () => clearErrors('businessName') })}
            aria-invalid={Boolean(errors.businessName)}
            className="h-[50px] rounded-xl border-line pl-11 text-[14.5px] font-semibold"
          />
        </div>
        <FieldErrorText error={errors.businessName} />
      </div>

      <ProfileIconSelect
        label="Business Type"
        icon={UtensilsCrossed}
        name="businessType"
        value={businessType}
        onChange={(value) => {
          setBusinessType(value);
          setValue('businessType', value, { shouldDirty: true });
          clearErrors('businessType');
        }}
        error={errors.businessType}
        options={BUSINESS_TYPE_OPTIONS}
        placeholder="Select business type"
        compact
        required
      />

      <ProfileIconSelect
        label="Recruiter Role (Optional)"
        icon={Briefcase}
        name="recruiterRole"
        value={recruiterRole}
        onChange={(value) => {
          setRecruiterRole(value);
          setValue('recruiterRole', value, { shouldDirty: true });
        }}
        options={ROLE_OPTIONS}
        placeholder="Select your role"
        compact
      />

      <ProfileIconSelect
        label="City / Location"
        icon={MapPin}
        name="city"
        value={city}
        onChange={(value) => {
          setCity(value);
          setValue('city', value, { shouldDirty: true });
          clearErrors('city');
          setArea('');
          setValue('area', '');
        }}
        error={errors.city}
        options={CITY_OPTIONS}
        placeholder="Select your city"
        compact
        required
      />

      <ProfileIconSelect
        label="Area / Locality (Optional)"
        icon={MapPin}
        name="area"
        value={area}
        onChange={(value) => {
          setArea(value);
          setValue('area', value, { shouldDirty: true });
        }}
        options={areaOptions.length > 0 ? areaOptions : AREA_FALLBACK_OPTIONS}
        placeholder="Select area"
        compact
      />

      <div className="flex flex-col gap-1 min-[640px]:col-span-2">
        <label htmlFor="recruiter-onboarding-email" className="text-[14px] font-bold text-ink">
          Email Address (Optional)
        </label>
        <div className="relative">
          <Mail
            className="pointer-events-none absolute top-1/2 left-3.5 size-[17px] -translate-y-1/2 text-brand-600"
            aria-hidden="true"
          />
          <Input
            id="recruiter-onboarding-email"
            type="email"
            placeholder="you@restaurant.in"
            {...register('email', { onChange: () => clearErrors('email') })}
            aria-invalid={Boolean(errors.email)}
            className="h-[50px] rounded-xl border-line pl-11 text-[14.5px] font-semibold"
          />
        </div>
        <FieldErrorText error={errors.email} />
      </div>

      <button
        type="submit"
        className={cn(
          homeButton('orange-base'),
          'mt-1 h-[54px] w-full justify-center text-[15px] font-extrabold min-[640px]:col-span-2'
        )}
      >
        Complete Profile →
      </button>
    </form>
  );
}
