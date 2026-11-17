import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ApiError } from '@/shared/api/errors';
import { Button } from '@/shared/ui/Button';
import { Field } from '@/shared/ui/Field';
import { Input, Select } from '@/shared/ui/Input';
import { BUSINESS_TYPES, type RecruiterInput } from '../schemas/adminRecruiter';
import { isMobileNumber, normalizePhone } from './phone';

const required = (label: string, max = 80) =>
  z
    .string()
    .trim()
    .min(2, `${label} must have at least 2 characters`)
    .max(max, `${label} is too long`);

/** An Indian mobile number: 10 digits starting 6 to 9, with an optional +91 and spaces or dashes. */

const recruiterFormSchema = z.object({
  business_name: required('Business name'),
  business_type: z.enum(BUSINESS_TYPES),
  area: required('Area'),
  city: required('City'),
  owner_name: required('Owner name'),
  phone: z
    .string()
    .trim()
    .min(1, 'Phone is required')
    .refine((v) => isMobileNumber(normalizePhone(v)), 'Enter a 10-digit mobile number'),
  email: z.string().trim().min(1, 'E-mail is required').email('Enter a valid e-mail address')
});

interface RecruiterFormProps {
  defaultValues: RecruiterInput;
  submitLabel: string;
  onSubmit: (values: RecruiterInput) => Promise<unknown>;
  onCancel: () => void;
}

/** The add and edit fields. Server field errors land on the matching input (API-04). */
export function RecruiterForm({
  defaultValues,
  submitLabel,
  onSubmit,
  onCancel
}: RecruiterFormProps) {
  const { register, handleSubmit, setError, formState } = useForm<RecruiterInput>({
    resolver: zodResolver(recruiterFormSchema),
    defaultValues
  });
  const errors = formState.errors;

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit({ ...values, phone: normalizePhone(values.phone) });
    } catch (err) {
      if (err instanceof ApiError) {
        Object.entries(err.fieldErrors).forEach(([field, message]) =>
          setError(field as keyof RecruiterInput, { message })
        );
      }
    }
  });

  return (
    <form
      onSubmit={submit}
      noValidate
      aria-label="Recruiter details"
      className="grid max-w-2xl gap-4 rounded-[18px] border border-line bg-surface p-4 sm:p-6"
    >
      <Field label="Business name" required error={errors.business_name?.message}>
        <Input {...register('business_name')} autoComplete="organization" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Business type" required error={errors.business_type?.message}>
          <Select {...register('business_type')}>
            {BUSINESS_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Owner name" required error={errors.owner_name?.message}>
          <Input {...register('owner_name')} autoComplete="name" />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Area" required error={errors.area?.message}>
          <Input {...register('area')} autoComplete="off" />
        </Field>
        <Field label="City" required error={errors.city?.message}>
          <Input {...register('city')} autoComplete="address-level2" />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Phone" required error={errors.phone?.message}>
          <Input type="tel" {...register('phone')} autoComplete="tel" />
        </Field>
        <Field label="E-mail" required error={errors.email?.message}>
          <Input type="email" {...register('email')} autoComplete="email" />
        </Field>
      </div>
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
