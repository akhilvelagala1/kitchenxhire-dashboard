import { Briefcase, Plus } from 'lucide-react';
import type {
  FieldErrors,
  UseFormRegister,
  UseFieldArrayReturn,
  UseFormSetValue,
  UseFormWatch
} from 'react-hook-form';
import { cn } from '@/shared/lib/cn';
import { Input } from '@/shared/ui/Input';
import { RESUME_EMPLOYMENT_TYPE_OPTIONS, RESUME_YEARS_OPTIONS } from '../content/resumeFormOptions';
import { emptyWorkEntry, type ResumeWizardFormValues } from '../schemas/jobSeekerResumeWizard';
import { ProfileIconSelect } from './ProfileIconSelect';
import { ResumeWizardEntryCard } from './ResumeWizardEntryCard';
import {
  resumeFieldInput,
  resumeFieldLabel,
  resumeWizardAddAction,
  resumeWizardFieldsWrap
} from './styles';

interface ResumeWizardWorkFieldsProps {
  register: UseFormRegister<ResumeWizardFormValues>;
  errors: FieldErrors<ResumeWizardFormValues>;
  setValue: UseFormSetValue<ResumeWizardFormValues>;
  watch: UseFormWatch<ResumeWizardFormValues>;
  workFields: UseFieldArrayReturn<ResumeWizardFormValues, 'workHistory'>['fields'];
  appendWork: UseFieldArrayReturn<ResumeWizardFormValues, 'workHistory'>['append'];
  removeWork: UseFieldArrayReturn<ResumeWizardFormValues, 'workHistory'>['remove'];
}

export function ResumeWizardWorkFields({
  register,
  errors,
  setValue,
  watch,
  workFields,
  appendWork,
  removeWork
}: ResumeWizardWorkFieldsProps) {
  return (
    <div className={cn(resumeWizardFieldsWrap, 'space-y-0')}>
      {workFields.map((field, index) => (
        <ResumeWizardEntryCard
          key={field.id}
          icon={Briefcase}
          title={`Experience ${index + 1}`}
          isFirst={index === 0}
          onRemove={workFields.length > 1 ? () => removeWork(index) : undefined}
        >
          <div className="grid gap-3 min-[768px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,200px)] min-[768px]:gap-x-4 min-[768px]:gap-y-3">
            <div className="flex flex-col gap-1.5">
              <label className={resumeFieldLabel} htmlFor={`work-title-${index}`}>
                Job title
              </label>
              <Input
                id={`work-title-${index}`}
                placeholder="e.g. Cook, Helper, Waiter"
                {...register(`workHistory.${index}.jobTitle`)}
                className={resumeFieldInput}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={resumeFieldLabel} htmlFor={`work-place-${index}`}>
                Type of restaurant
              </label>
              <Input
                id={`work-place-${index}`}
                placeholder="e.g. Hotel, Dhaba, Cloud kitchen"
                {...register(`workHistory.${index}.workplaceType`)}
                className={resumeFieldInput}
              />
            </div>
            <ProfileIconSelect
              label="Years of experience"
              name={`workHistory.${index}.yearsOfExperience`}
              value={watch(`workHistory.${index}.yearsOfExperience`)}
              onChange={(next) =>
                setValue(`workHistory.${index}.yearsOfExperience`, next, {
                  shouldDirty: true,
                  shouldValidate: true
                })
              }
              error={errors.workHistory?.[index]?.yearsOfExperience}
              options={[...RESUME_YEARS_OPTIONS]}
              placeholder="Years"
              variant="resume"
            />
            <ProfileIconSelect
              label="Employment type"
              name={`workHistory.${index}.employmentType`}
              value={watch(`workHistory.${index}.employmentType`)}
              onChange={(next) =>
                setValue(`workHistory.${index}.employmentType`, next, {
                  shouldDirty: true,
                  shouldValidate: true
                })
              }
              error={errors.workHistory?.[index]?.employmentType}
              options={[...RESUME_EMPLOYMENT_TYPE_OPTIONS]}
              placeholder="Select type"
              variant="resume"
            />
            <div className="flex flex-col gap-1.5">
              <label className={resumeFieldLabel} htmlFor={`work-start-${index}`}>
                Start date
              </label>
              <Input
                id={`work-start-${index}`}
                type="month"
                {...register(`workHistory.${index}.startDate`)}
                className={resumeFieldInput}
              />
            </div>
          </div>
        </ResumeWizardEntryCard>
      ))}

      {errors.workHistory?.message && (
        <p role="alert" className="mt-2 text-[12px] font-medium text-danger-600">
          {errors.workHistory.message}
        </p>
      )}

      <button
        type="button"
        onClick={() => appendWork({ ...emptyWorkEntry })}
        className={cn(resumeWizardAddAction, 'mt-3')}
      >
        <Plus className="size-4" aria-hidden="true" />
        Add another experience
      </button>
    </div>
  );
}
