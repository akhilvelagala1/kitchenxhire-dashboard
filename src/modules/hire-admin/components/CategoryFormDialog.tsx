import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { ApiError } from '@/shared/api/errors';
import { Button } from '@/shared/ui/Button';
import { Dialog } from '@/shared/ui/Dialog';
import { Field } from '@/shared/ui/Field';
import { Input, Select, Textarea } from '@/shared/ui/Input';
import {
  CATEGORY_BUSINESS_TYPES,
  CATEGORY_ICONS,
  CATEGORY_ICON_LABELS,
  type CategoryInput,
  type HireAdminCategory
} from '../schemas/adminCategoryRole';
import { useCreateCategory, useUpdateCategory } from './categoryMutations';
import { CategoryIconTile } from './CategoryIconTile';

const categoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must have at least 2 characters')
    .max(40, 'Name must have at most 40 characters'),
  code: z
    .string()
    .trim()
    .regex(
      /^[A-Z][A-Z0-9_]{1,39}$/,
      'Use capital letters, digits and underscores, starting with a letter (2 to 40 characters)'
    ),
  business_type: z.enum(CATEGORY_BUSINESS_TYPES),
  icon: z.enum(CATEGORY_ICONS),
  description: z.string().trim().max(200, 'Description must have at most 200 characters')
});

const EMPTY: CategoryInput = {
  name: '',
  code: '',
  business_type: 'Restaurant',
  icon: 'utensils',
  description: ''
};

const FIELDS = Object.keys(EMPTY) as (keyof CategoryInput)[];

/** `Cloud Kitchen` becomes `CLOUD_KITCHEN`: upper case, other characters turned into single underscores. */
function suggestCode(name: string): string {
  return name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/^[0-9_]+/, '')
    .slice(0, 40);
}

function CategoryFormBody({
  existing,
  onClose
}: {
  existing: HireAdminCategory | undefined;
  onClose: () => void;
}) {
  const create = useCreateCategory();
  const update = useUpdateCategory(existing?.category_id ?? '');
  const defaults: CategoryInput = existing
    ? {
        name: existing.name,
        code: existing.code,
        business_type: existing.business_type,
        icon: existing.icon,
        description: existing.description
      }
    : EMPTY;
  // The code follows the name until the person types in the code box themselves.
  const [codeEdited, setCodeEdited] = useState(false);
  const { register, handleSubmit, setError, setValue, control, formState } = useForm<CategoryInput>(
    {
      resolver: zodResolver(categoryFormSchema),
      defaultValues: defaults
    }
  );
  const errors = formState.errors;
  const icon = useWatch({ control, name: 'icon' });

  const save = handleSubmit(async (values) => {
    try {
      if (!existing) {
        await create.mutateAsync(values);
      } else {
        // Send only what the person changed (the code never changes), and nothing when nothing did.
        const changed = Object.fromEntries(
          FIELDS.filter((f) => f !== 'code' && values[f] !== defaults[f]).map((f) => [f, values[f]])
        ) as Partial<CategoryInput>;
        if (Object.keys(changed).length > 0) await update.mutateAsync(changed);
      }
      onClose();
    } catch (err) {
      if (!(err instanceof ApiError)) return;
      if (err.status === 409) {
        setError('code', { message: 'This code is already used by another category' });
        return;
      }
      Object.entries(err.fieldErrors).forEach(([field, message]) =>
        setError(field as keyof CategoryInput, { message })
      );
    }
  });

  const nameField = register('name', {
    onChange: (event) => {
      if (!existing && !codeEdited) {
        setValue('code', suggestCode(event.target.value), {
          shouldValidate: formState.isSubmitted
        });
      }
    }
  });
  const codeField = register('code', {
    onChange: () => {
      setCodeEdited(true);
    }
  });

  return (
    <form onSubmit={save} noValidate aria-label="Category details" className="grid gap-4">
      <Field label="Name" required error={errors.name?.message}>
        <Input {...nameField} autoComplete="off" />
      </Field>
      <Field
        label="Code"
        required
        error={errors.code?.message}
        hint={
          existing ? 'The code cannot be changed.' : 'Suggested from the name. You can edit it.'
        }
      >
        <Input {...codeField} readOnly={Boolean(existing)} autoComplete="off" spellCheck={false} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Business type" required error={errors.business_type?.message}>
          <Select {...register('business_type')}>
            {CATEGORY_BUSINESS_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Icon" required error={errors.icon?.message}>
          <Select {...register('icon')}>
            {CATEGORY_ICONS.map((key) => (
              <option key={key} value={key}>
                {CATEGORY_ICON_LABELS[key]}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="flex items-center gap-3 text-sm text-ink-600">
        <CategoryIconTile icon={icon} />
        <span>How the category looks in the table</span>
      </div>
      <Field label="Description" error={errors.description?.message}>
        <Textarea rows={3} {...register('description')} />
      </Field>
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" loading={formState.isSubmitting}>
          {existing ? 'Save changes' : 'Add category'}
        </Button>
      </div>
    </form>
  );
}

/**
 * Add (no `category`) and edit (with `category`) in one dialog. The form is mounted only while the
 * dialog is open, so every opening starts from the stored values and a fresh auto-suggested code.
 */
export function CategoryFormDialog({
  open,
  category,
  onClose
}: {
  open: boolean;
  category?: HireAdminCategory;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} title={category ? 'Edit Category' : 'Add Category'}>
      <CategoryFormBody existing={category} onClose={onClose} />
    </Dialog>
  );
}
