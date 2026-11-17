import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ApiError } from '@/shared/api/errors';
import { Button } from '@/shared/ui/Button';
import { Field } from '@/shared/ui/Field';
import { Input, Select } from '@/shared/ui/Input';
import { BUSINESS_KINDS, type BusinessInput } from '../schemas/adminBusiness';
import { isMobileNumber, normalizePhone } from './phone';

const required = (label: string, max = 80) =>
  z
    .string()
    .trim()
    .min(2, `${label} must have at least 2 characters`)
    .max(max, `${label} is too long`);

const businessFormSchema = z.object({
  business_name: required('Business name'),
  business_type: z.enum(BUSINESS_KINDS),
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

interface BusinessFormProps {
  defaultValues: BusinessInput;
  submitLabel: string;
  /** Receives the cleaned values: trimmed text and the phone as 10 digits. */
  onSubmit: (values: BusinessInput) => Promise<unknown>;
  onCancel: () => void;
}

/** The add and edit fields. Server field errors land on the matching input (API-04). */
export function BusinessForm({
  defaultValues,
  submitLabel,
  onSubmit,
  onCancel
}: BusinessFormProps) {
  const { register, handleSubmit, setError, formState } = useForm<BusinessInput>({
    resolver: zodResolver(businessFormSchema),
    defaultValues
  });
  const errors = formState.errors;

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit({ ...values, phone: normalizePhone(values.phone) });
    } catch (err) {
      if (err instanceof ApiError) {
        Object.entries(err.fieldErrors).forEach(([field, message]) =>
          setError(field as keyof BusinessInput, { message })
        );
      }
    }
  });

  return (
    <form onSubmit={submit} noValidate aria-label="Business details" className="grid gap-4">
      <Field label="Business name" required error={errors.business_name?.message}>
        <Input {...register('business_name')} autoComplete="organization" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Business type" required error={errors.business_type?.message}>
          <Select {...register('business_type')}>
            {BUSINESS_KINDS.map((kind) => (
              <option key={kind} value={kind}>
                {kind}
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
