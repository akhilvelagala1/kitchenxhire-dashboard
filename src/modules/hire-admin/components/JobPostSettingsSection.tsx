import { CalendarDays } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';
import { Field } from '@/shared/ui/Field';
import { Input, Select } from '@/shared/ui/Input';
import {
  JOB_VISIBILITY_OPTIONS,
  jobPostToday,
  type JobPostFormValues
} from '../schemas/adminJobPost';
import { JobPostSectionCard } from './JobPostSectionCard';
import { jobPostControl } from './jobPostStyles';

/** Card 5: when applications close and who can see the job. */
export function JobPostSettingsSection({ form }: { form: UseFormReturn<JobPostFormValues> }) {
  const errors = form.formState.errors;
  return (
    <JobPostSectionCard
      icon={CalendarDays}
      title="Application Settings"
      description="Set the application timeline and visibility."
    >
      <div className="grid gap-x-5 gap-y-3 md:grid-cols-2">
        <Field label="Application Deadline" required error={errors.application_deadline?.message}>
          <Input
            type="date"
            min={jobPostToday()}
            className={jobPostControl}
            {...form.register('application_deadline')}
          />
        </Field>
        <Field label="Job Visibility" required error={errors.visibility?.message}>
          <Select className={jobPostControl} {...form.register('visibility')}>
            <option value="">Select visibility</option>
            {JOB_VISIBILITY_OPTIONS.map((option) => (
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
