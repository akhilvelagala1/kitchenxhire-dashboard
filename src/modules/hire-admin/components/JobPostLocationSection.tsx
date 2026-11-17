import { MapPin } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';
import { Field } from '@/shared/ui/Field';
import { Input, Select } from '@/shared/ui/Input';
import {
  JOB_CITY_OPTIONS,
  JOB_WORK_LOCATION_OPTIONS,
  type JobPostFormValues
} from '../schemas/adminJobPost';
import { JobPostSectionCard } from './JobPostSectionCard';
import { jobPostControl, jobPostFieldGrid } from './jobPostStyles';

/** Card 2 of the Post a Job form: city, work location and the optional street address. */
export function JobPostLocationSection({ form }: { form: UseFormReturn<JobPostFormValues> }) {
  const {
    register,
    formState: { errors }
  } = form;
  return (
    <JobPostSectionCard icon={MapPin} title="Job Location" description="Where the job is based.">
      <div className={jobPostFieldGrid}>
        <Field label="City" required error={errors.city?.message}>
          <Select className={jobPostControl} {...register('city')}>
            <option value="">Select city</option>
            {JOB_CITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Work Location" required error={errors.work_location?.message}>
          <Select className={jobPostControl} {...register('work_location')}>
            <option value="">Select work location</option>
            {JOB_WORK_LOCATION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
        <div className="md:col-span-2">
          <Field label="Address" error={errors.address?.message}>
            <Input
              placeholder="Street, area, city – PIN code"
              autoComplete="street-address"
              className={jobPostControl}
              {...register('address')}
            />
          </Field>
        </div>
      </div>
    </JobPostSectionCard>
  );
}
