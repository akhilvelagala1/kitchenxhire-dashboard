import { zodResolver } from '@hookform/resolvers/zod';
import { Lock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ApiError } from '@/shared/api/errors';
import { Button } from '@/shared/ui/Button';
import { Dialog } from '@/shared/ui/Dialog';
import { Field } from '@/shared/ui/Field';
import { Input, Textarea } from '@/shared/ui/Input';
import type { HireAdminRole, RoleInput } from '../schemas/adminCategoryRole';
import { useCreateRole, useUpdateRole } from './roleMutations';

const roleFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Role name must have at least 2 characters')
    .max(40, 'Role name can have at most 40 characters'),
  description: z.string().trim().max(200, 'Description can have at most 200 characters')
});

const EMPTY: RoleInput = { name: '', description: '' };

function RoleFormBody({
  existing,
  onClose
}: {
  existing: HireAdminRole | undefined;
  onClose: () => void;
}) {
  const create = useCreateRole();
  const update = useUpdateRole(existing?.role_id ?? '');
  const defaults: RoleInput = existing
    ? { name: existing.name, description: existing.description }
    : EMPTY;
  const { register, handleSubmit, setError, formState } = useForm<RoleInput>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: defaults
  });
  const errors = formState.errors;

  const submit = handleSubmit(async (values) => {
    try {
      if (!existing) {
        await create.mutateAsync(values);
      } else {
        // Send only what the person changed, and nothing when nothing changed.
        const changed: Partial<RoleInput> = {};
        if (!existing.protected && values.name !== defaults.name) changed.name = values.name;
        if (values.description !== defaults.description) changed.description = values.description;
        if (Object.keys(changed).length > 0) await update.mutateAsync(changed);
      }
      onClose();
    } catch (err) {
      if (!(err instanceof ApiError)) return;
      const fields = Object.entries(err.fieldErrors);
      fields.forEach(([field, message]) => setError(field as keyof RoleInput, { message }));
      // A duplicate name comes back as a plain 409 and belongs on the name field.
      if (fields.length === 0 && err.status === 409) setError('name', { message: err.message });
    }
  });

  return (
    <form onSubmit={submit} noValidate aria-label="Role details" className="grid gap-4">
      <Field
        label="Role name"
        required
        error={errors.name?.message}
        hint={
          existing?.protected ? 'The name of a protected system role cannot be changed.' : undefined
        }
      >
        <Input {...register('name')} readOnly={existing?.protected} autoComplete="off" />
      </Field>
      <Field label="Description" error={errors.description?.message}>
        <Textarea rows={3} {...register('description')} />
      </Field>
      {existing?.protected && (
        <p className="flex items-center gap-2 text-sm text-ink-soft">
          <Lock className="size-4 shrink-0" aria-hidden />
          Protected system role. It cannot be deactivated, deleted or have its permissions changed.
        </p>
      )}
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" loading={formState.isSubmitting}>
          {existing ? 'Save changes' : 'Add role'}
        </Button>
      </div>
    </form>
  );
}

/**
 * Add (no `role`) and edit (with `role`) in one dialog. The form is mounted only while the dialog
 * is open, so every opening starts from the stored values.
 */
export function RoleFormDialog({
  open,
  role,
  onClose
}: {
  open: boolean;
  role?: HireAdminRole;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} title={role ? 'Edit Role' : 'Add Role'}>
      <RoleFormBody existing={role} onClose={onClose} />
    </Dialog>
  );
}
