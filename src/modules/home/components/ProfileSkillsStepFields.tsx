import { Briefcase, Building2, Info } from 'lucide-react';
import type {
  FieldErrors,
  UseFormClearErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch
} from 'react-hook-form';
import { Input } from '@/shared/ui/Input';
import {
  PROFILE_CURRENT_ROLE_OPTIONS,
  PROFILE_SKILL_OPTIONS,
  formatPrimarySkills,
  parsePrimarySkills
} from '../content/profileFormOptions';
import type { ProfileWizardFormValues } from '../schemas/jobSeekerProfileWizard';
import { ProfileOptionWithOther } from './ProfileOptionWithOther';
import { ProfileSkillsMultiSelect } from './ProfileSkillsMultiSelect';

interface ProfileSkillsStepFieldsProps {
  register: UseFormRegister<ProfileWizardFormValues>;
  errors: FieldErrors<ProfileWizardFormValues>;
  setValue: UseFormSetValue<ProfileWizardFormValues>;
  clearErrors: UseFormClearErrors<ProfileWizardFormValues>;
  watch: UseFormWatch<ProfileWizardFormValues>;
}

/** Create Profile → Step 2: Skills & Experience fields. */
export function ProfileSkillsStepFields({
  register,
  errors,
  setValue,
  clearErrors,
  watch
}: ProfileSkillsStepFieldsProps) {
  const lastEmployerRegister = register('lastEmployer');

  return (
    <div className="mt-5 grid gap-5">
      <ProfileSkillsMultiSelect
        label="Primary Skills"
        name="primarySkills"
        required
        values={parsePrimarySkills(watch('primarySkills') ?? '')}
        options={PROFILE_SKILL_OPTIONS}
        error={errors.primarySkills}
        onChange={(next) => {
          clearErrors('primarySkills');
          setValue('primarySkills', formatPrimarySkills(next), { shouldDirty: true });
        }}
      />
      <div className="grid gap-5 min-[768px]:grid-cols-2 min-[768px]:gap-x-6">
        <ProfileOptionWithOther
          label="Current / Last Role Title"
          icon={Briefcase}
          name="currentRoleTitle"
          required
          value={watch('currentRoleTitle')}
          onChange={(next) => {
            clearErrors('currentRoleTitle');
            setValue('currentRoleTitle', next, { shouldDirty: true });
          }}
          error={errors.currentRoleTitle}
          options={PROFILE_CURRENT_ROLE_OPTIONS}
          customPlaceholder="e.g. Commis Chef"
        />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="lastEmployer" className="text-[14px] font-bold text-ink">
            Last Employer <span className="font-semibold text-ink-500">(optional)</span>
          </label>
          <div className="relative w-full">
            <Building2
              className="pointer-events-none absolute top-1/2 left-3.5 z-10 size-[19px] -translate-y-1/2 text-brand-600"
              aria-hidden="true"
            />
            <Input
              id="lastEmployer"
              {...lastEmployerRegister}
              onChange={(event) => {
                void lastEmployerRegister.onChange(event);
                if (errors.lastEmployer) clearErrors('lastEmployer');
              }}
              placeholder="e.g. Grand Banquet Hotels"
              aria-invalid={Boolean(errors.lastEmployer)}
              className="h-[52px] rounded-xl pl-11 text-[14px] font-semibold"
            />
          </div>
          {errors.lastEmployer ? (
            <p role="alert" className="text-[12px] font-medium text-danger-600">
              {errors.lastEmployer.message}
            </p>
          ) : null}
        </div>
      </div>
      <div className="flex gap-3 rounded-xl bg-[#FFF3ED] px-4 py-3.5 text-[14px] font-semibold leading-snug text-ink-600">
        <Info className="size-5 shrink-0 text-brand-600" aria-hidden="true" />
        <p>
          Tip: Add relevant kitchen skills and your latest role to help employers find a better
          match.
        </p>
      </div>
    </div>
  );
}
