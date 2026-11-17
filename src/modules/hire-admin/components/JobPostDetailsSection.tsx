import { FileText } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';
import { Field } from '@/shared/ui/Field';
import { Textarea } from '@/shared/ui/Input';
import { JOB_TEXT_LIMIT, type JobPostFormValues } from '../schemas/adminJobPost';
import { JobPostSectionCard } from './JobPostSectionCard';
import { JobPostSkillsInput } from './JobPostSkillsInput';
import { jobPostCounter, jobPostTextarea } from './jobPostStyles';

type TextFieldName = 'description' | 'responsibilities' | 'requirements';

const TEXT_FIELDS: { name: TextFieldName; label: string; placeholder: string }[] = [
  {
    name: 'description',
    label: 'Job Description',
    placeholder: 'Describe the role and what the outlet is looking for'
  },
  {
    name: 'responsibilities',
    label: 'Responsibilities',
    placeholder: 'List each responsibility on a new line'
  },
  {
    name: 'requirements',
    label: 'Requirements',
    placeholder: 'List each requirement on a new line'
  }
];

/** Card 4: the three long-text fields with live character counters, then the skills tags. */
export function JobPostDetailsSection({ form }: { form: UseFormReturn<JobPostFormValues> }) {
  const errors = form.formState.errors;
  return (
    <JobPostSectionCard
      icon={FileText}
      title="Job Details"
      description="Describe the role, responsibilities and ideal candidate."
    >
      <div className="flex flex-col gap-3 lg:gap-0">
        <div className="grid gap-x-5 gap-y-3 lg:grid-cols-3">
          {TEXT_FIELDS.map(({ name, label, placeholder }) => (
            <div key={name} className="flex flex-col">
              <Field label={label} required error={errors[name]?.message}>
                <Textarea
                  className={jobPostTextarea}
                  maxLength={JOB_TEXT_LIMIT}
                  placeholder={placeholder}
                  {...form.register(name)}
                />
              </Field>
              <p className={jobPostCounter}>
                {form.watch(name)?.length ?? 0} / {JOB_TEXT_LIMIT}
              </p>
            </div>
          ))}
        </div>
        <JobPostSkillsInput
          skills={form.watch('skills')}
          onChange={(next) =>
            form.setValue('skills', next, { shouldDirty: true, shouldValidate: true })
          }
          error={form.formState.errors.skills?.message as string | undefined}
        />
      </div>
    </JobPostSectionCard>
  );
}
