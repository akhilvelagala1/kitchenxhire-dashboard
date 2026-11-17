import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ApiError } from '@/shared/api/errors';
import { AsyncSelect } from '@/shared/components/AsyncSelect';
import { Button } from '@/shared/ui/Button';
import { Field } from '@/shared/ui/Field';
import { Input, Select, Textarea } from '@/shared/ui/Input';
import { categoryApi } from '../api/categoryApi';
import { categoryKeys } from '../api/categoryKeys';
import {
  CATEGORY_STATUSES,
  categoryFormSchema,
  type CategoryFormValues
} from '../schemas/category';

interface CategoryFormProps {
  defaultValues: CategoryFormValues;
  submitLabel: string;
  onSubmit: (values: CategoryFormValues) => Promise<unknown>;
  onCancel: () => void;
}

export function CategoryForm({
  defaultValues,
  submitLabel,
  onSubmit,
  onCancel
}: CategoryFormProps) {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues
  });
  const { register, control, handleSubmit, setError, formState } = form;
  const errors = formState.errors;

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values);
    } catch (err) {
      // Server field errors land on the matching input (API-04).
      if (err instanceof ApiError) {
        Object.entries(err.fieldErrors).forEach(([field, message]) =>
          setError(field as keyof CategoryFormValues, { message })
        );
      }
    }
  });

  return (
    <form
      onSubmit={submit}
      noValidate
      className="grid max-w-2xl gap-4 rounded-lg border border-line bg-surface p-6"
    >
      <Field label="Name" required error={errors.name?.message}>
        <Input {...register('name')} autoComplete="off" />
      </Field>
      <Field
        label="Code"
        required
        hint="Used to match rows on import."
        error={errors.code?.message}
      >
        <Input {...register('code')} autoComplete="off" />
      </Field>
      <Field label="Parent category" error={errors.parent?.message}>
        <Controller
          control={control}
          name="parent"
          render={({ field }) => (
            <AsyncSelect
              queryKey={categoryKeys.options()}
              loadOptions={categoryApi.options}
              value={field.value}
              onChange={field.onChange}
              placeholder="Top level"
            />
          )}
        />
      </Field>
      <Field label="Description" error={errors.description?.message}>
        <Textarea rows={3} {...register('description')} />
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Status" required error={errors.status?.message}>
          <Select {...register('status')}>
            {CATEGORY_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Sort order" error={errors.sort_order?.message}>
          <Input type="number" min={0} {...register('sort_order', { valueAsNumber: true })} />
        </Field>
      </div>
      <div className="flex justify-end gap-2">
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
