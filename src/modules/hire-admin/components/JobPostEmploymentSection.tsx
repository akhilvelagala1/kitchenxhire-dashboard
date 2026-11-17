import { useId, type ReactNode } from 'react';
import { BriefcaseBusiness } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';
import { cn } from '@/shared/lib/cn';
import { Field } from '@/shared/ui/Field';
import { Input, Select } from '@/shared/ui/Input';
import {
  JOB_EMPLOYMENT_TYPE_OPTIONS,
  JOB_EXPERIENCE_OPTIONS,
  JOB_WORK_SHIFT_OPTIONS,
  type JobPostFormValues
} from '../schemas/adminJobPost';
import { JobPostSectionCard } from './JobPostSectionCard';
import { jobPostControl, jobPostFieldGrid, jobPostLabel } from './jobPostStyles';

// Room for the ₹ sign. From lg jobPostControl pads the sides with `!`, so the left padding needs `!` too.
const salaryInput = cn(jobPostControl, 'pl-7 lg:pl-7!');

function RupeeInput({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-w-0 flex-1">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-ink-soft lg:left-3.5 lg:text-dense-md"
      >
        ₹
      </span>
      {children}
    </div>
  );
}

/** Minimum and maximum salary: one labelled group, two inputs, one error line beneath. */
function SalaryRange({ form }: { form: UseFormReturn<JobPostFormValues> }) {
  const {
    register,
    formState: { errors }
  } = form;
  const id = useId();
  const error = errors.salary_min?.message ?? errors.salary_max?.message;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div role="group" aria-labelledby={`${id}-label`} className="flex flex-col gap-1">
      <span id={`${id}-label`} className={jobPostLabel}>
        Salary Range
        <span className="text-danger-600"> *</span>
      </span>
      <div className="flex items-center gap-2">
        <RupeeInput>
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            placeholder="Min"
            aria-label="Minimum salary"
            aria-invalid={Boolean(errors.salary_min)}
            aria-describedby={errorId}
            className={salaryInput}
            {...register('salary_min')}
          />
        </RupeeInput>
        <span aria-hidden className="text-sm text-ink-soft lg:text-dense-md">
          –
        </span>
        <RupeeInput>
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            placeholder="Max"
            aria-label="Maximum salary"
            aria-invalid={Boolean(errors.salary_max)}
            aria-describedby={errorId}
            className={salaryInput}
            {...register('salary_max')}
          />
        </RupeeInput>
      </div>
      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-sm text-danger-600 lg:text-dense-sm lg:leading-3.5"
        >
          {error}
        </p>
      )}
    </div>
  );
}

/** Card 3 of the Post a Job form: employment type, salary range, work shift and experience. */
export function JobPostEmploymentSection({ form }: { form: UseFormReturn<JobPostFormValues> }) {
  const {
    register,
    formState: { errors }
  } = form;
  return (
    <JobPostSectionCard
      icon={BriefcaseBusiness}
      title="Employment Details"
      description="Nature of employment and compensation."
    >
      <div className={jobPostFieldGrid}>
        <Field label="Employment Type" required error={errors.employment_type?.message}>
          <Select className={jobPostControl} {...register('employment_type')}>
            <option value="">Select employment type</option>
            {JOB_EMPLOYMENT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
        <SalaryRange form={form} />
        <Field label="Work Shift" required error={errors.work_shift?.message}>
          <Select className={jobPostControl} {...register('work_shift')}>
            <option value="">Select work shift</option>
            {JOB_WORK_SHIFT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Experience Required" required error={errors.experience_required?.message}>
          <Select className={jobPostControl} {...register('experience_required')}>
            <option value="">Select experience</option>
            {JOB_EXPERIENCE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>
    </JobPostSectionCard>
  );
}
