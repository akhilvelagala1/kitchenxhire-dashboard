import { Briefcase } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';
import { Field } from '@/shared/ui/Field';
import { Input, Select } from '@/shared/ui/Input';
import {
  JOB_CATEGORY_OPTIONS,
  JOB_DEPARTMENT_OPTIONS,
  type JobPostFormValues
} from '../schemas/adminJobPost';
import { JobPostSectionCard } from './JobPostSectionCard';
import { jobPostControl, jobPostFieldGrid } from './jobPostStyles';

/** Card 1 of the Post a Job form: title, category, department and number of openings. */
export function JobPostInfoSection({ form }: { form: UseFormReturn<JobPostFormValues> }) {
  const {
    register,
    formState: { errors }
  } = form;
  return (
    <JobPostSectionCard
      icon={Briefcase}
      title="Job Information"
      description="Basic details about the job posting."
    >
      <div className={jobPostFieldGrid}>
        <Field label="Job Title" required error={errors.title?.message}>
          <Input
            placeholder="e.g. Cook / Chef"
            autoComplete="off"
            className={jobPostControl}
            {...register('title')}
          />
        </Field>
        <Field label="Job Category" required error={errors.job_category?.message}>
          <Select className={jobPostControl} {...register('job_category')}>
            <option value="">Select category</option>
            {JOB_CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Department" required error={errors.department?.message}>
          <Select className={jobPostControl} {...register('department')}>
            <option value="">Select department</option>
            {JOB_DEPARTMENT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Number of Openings" required error={errors.openings?.message}>
          <Input
            type="number"
            inputMode="numeric"
            min={1}
            max={999}
            step={1}
            className={jobPostControl}
            {...register('openings')}
          />
        </Field>
      </div>
    </JobPostSectionCard>
  );
}
