import type {
  FieldErrors,
  UseFormClearErrors,
  UseFormSetValue,
  UseFormWatch
} from 'react-hook-form';
import { cn } from '@/shared/lib/cn';
import {
  RESUME_LANGUAGE_OPTIONS,
  RESUME_QUALIFICATION_OPTIONS,
  RESUME_SKILL_OPTIONS
} from '../content/resumeFormOptions';
import { suggestResumeSkills } from '../lib/resumeSuggestions';
import type { ResumeWizardFormValues } from '../schemas/jobSeekerResumeWizard';
import { HireChipField } from './HireChipField';
import { ProfileIconSelect } from './ProfileIconSelect';
import { resumeWizardFieldsWrap } from './styles';

interface ResumeWizardEducationFieldsProps {
  errors: FieldErrors<ResumeWizardFormValues>;
  setValue: UseFormSetValue<ResumeWizardFormValues>;
  clearErrors: UseFormClearErrors<ResumeWizardFormValues>;
  watch: UseFormWatch<ResumeWizardFormValues>;
}

export function ResumeWizardEducationFields({
  errors,
  setValue,
  clearErrors,
  watch
}: ResumeWizardEducationFieldsProps) {
  const qualification = watch('qualification');
  const languages = watch('languages');
  const skills = watch('skills');
  const jobTitle = watch('workHistory.0.jobTitle');

  return (
    <div className={cn(resumeWizardFieldsWrap, 'grid content-start gap-4')}>
      <ProfileIconSelect
        label="Qualification"
        name="qualification"
        value={qualification}
        onChange={(next) => {
          setValue('qualification', next, { shouldDirty: true, shouldValidate: true });
          setValue('skills', suggestResumeSkills(next, jobTitle), {
            shouldDirty: true,
            shouldValidate: true
          });
        }}
        error={errors.qualification}
        options={[...RESUME_QUALIFICATION_OPTIONS]}
        placeholder="Select qualification"
        variant="resume"
        className="max-w-[240px]"
      />

      <div className="grid gap-4 min-[768px]:grid-cols-2 min-[768px]:items-start min-[768px]:gap-x-6">
        <HireChipField
          label="Languages"
          addLabel="Add language"
          values={languages}
          options={RESUME_LANGUAGE_OPTIONS}
          onChange={(next) => {
            setValue('languages', next, { shouldDirty: true, shouldValidate: true });
            if (next.length > 0) clearErrors('languages');
          }}
          error={errors.languages}
        />

        <HireChipField
          label="Skills"
          addLabel="Add skill"
          values={skills}
          options={RESUME_SKILL_OPTIONS}
          onChange={(next) => {
            setValue('skills', next, { shouldDirty: true, shouldValidate: true });
            if (next.length > 0) clearErrors('skills');
          }}
          error={errors.skills}
        />
      </div>
    </div>
  );
}
