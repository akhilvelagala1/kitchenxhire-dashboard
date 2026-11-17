import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ApiError } from '@/shared/api/errors';
import { Button } from '@/shared/ui/Button';
import { Field } from '@/shared/ui/Field';
import { Input } from '@/shared/ui/Input';
import type { JobSeekerInput } from '../schemas/adminJobSeeker';
import { isMobileNumber, normalizePhone } from './phone';

const schema = z.object({
  name: z.string().trim().min(2, 'Enter the full name (at least 2 characters)').max(80),
  email: z.string().trim().pipe(z.email('Enter a valid e-mail address')),
  phone: z
    .string()
    .trim()
    .refine(
      (v) => isMobileNumber(normalizePhone(v)),
      'Enter a 10-digit mobile number, for example 98765 43210'
    ),
  city: z.string().trim().min(2, 'Enter the city').max(60),
  preferred_job_title: z.string().trim().min(2, 'Enter the preferred job title').max(80),
  experience_years: z
    .number({ error: 'Enter the years of experience as a number' })
    .int('Enter whole years')
    .min(0, 'Experience cannot be negative')
    .max(50, 'Experience cannot be more than 50 years')
});

interface JobSeekerFormProps {
  defaultValues: JobSeekerInput;
  submitLabel: string;
  onSubmit: (values: JobSeekerInput) => Promise<unknown>;
  onCancel: () => void;
}

/** The six fields the add and edit pages share. The page decides what is sent and where to go next. */
export function JobSeekerForm({
  defaultValues,
  submitLabel,
  onSubmit,
  onCancel
}: JobSeekerFormProps) {
  const { register, handleSubmit, setError, formState } = useForm<JobSeekerInput>({
    resolver: zodResolver(schema),
    defaultValues
  });
  const errors = formState.errors;

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit({ ...values, phone: normalizePhone(values.phone) });
    } catch (err) {
      // Server field errors land on the matching input; anything else already showed a toast.
      if (err instanceof ApiError) {
        Object.entries(err.fieldErrors).forEach(([field, message]) =>
          setError(field as keyof JobSeekerInput, { message })
        );
      }
    }
  });

  return (
    <form
      onSubmit={submit}
      noValidate
      className="grid gap-4 rounded-[18px] border border-line bg-surface p-4 sm:p-6"
    >
      <Field label="Full name" required error={errors.name?.message}>
        <Input {...register('name')} autoComplete="name" />
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="E-mail" required error={errors.email?.message}>
          <Input type="email" autoComplete="email" {...register('email')} />
        </Field>
        <Field label="Phone" required error={errors.phone?.message}>
          <Input type="tel" autoComplete="tel" {...register('phone')} />
        </Field>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="City" required error={errors.city?.message}>
          <Input autoComplete="address-level2" {...register('city')} />
        </Field>
        <Field label="Preferred job title" required error={errors.preferred_job_title?.message}>
          <Input autoComplete="off" {...register('preferred_job_title')} />
        </Field>
      </div>
      <Field
        label="Years of experience"
        required
        hint="Whole years, 0 to 50."
        error={errors.experience_years?.message}
      >
        <Input
          type="number"
          inputMode="numeric"
          min={0}
          max={50}
          step={1}
          {...register('experience_years', { valueAsNumber: true })}
        />
      </Field>
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={formState.isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
