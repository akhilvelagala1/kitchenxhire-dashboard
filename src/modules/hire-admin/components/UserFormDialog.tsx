import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ApiError } from '@/shared/api/errors';
import { Button } from '@/shared/ui/Button';
import { Dialog } from '@/shared/ui/Dialog';
import { Field } from '@/shared/ui/Field';
import { Input, Select } from '@/shared/ui/Input';
import {
  USER_ACCESS_SCOPES,
  USER_DEPARTMENTS,
  USER_ROLES,
  type HireAdminUser,
  type UserInput
} from '../schemas/adminUser';
import { useCreateUser, useUpdateUser } from './userMutations';

const isOneOf = (choices: readonly string[]) => (value: string) => choices.includes(value);

const schema = z.object({
  name: z.string().trim().min(2, 'Enter the full name (at least 2 characters)').max(80),
  email: z.string().trim().pipe(z.email('Enter a valid e-mail address')),
  role: z.string().refine(isOneOf(USER_ROLES), 'Choose a role'),
  department: z.string().refine(isOneOf(USER_DEPARTMENTS), 'Choose a department'),
  access_scope: z.string().refine(isOneOf(USER_ACCESS_SCOPES), 'Choose an access scope')
});

type FormValues = z.infer<typeof schema>;

const EMPTY: FormValues = { name: '', email: '', role: '', department: '', access_scope: '' };
const FIELDS = Object.keys(EMPTY) as (keyof FormValues)[];

function UserForm({
  existing,
  onClose
}: {
  existing: HireAdminUser | undefined;
  onClose: () => void;
}) {
  const create = useCreateUser();
  const update = useUpdateUser(existing?.user_id ?? '');
  const defaults: FormValues = existing
    ? {
        name: existing.name,
        email: existing.email,
        role: existing.role,
        department: existing.department,
        access_scope: existing.access_scope
      }
    : EMPTY;
  const { register, handleSubmit, setError, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaults
  });
  const errors = formState.errors;

  const submit = handleSubmit(async (values) => {
    try {
      if (!existing) {
        await create.mutateAsync(values as UserInput);
      } else {
        // Send only what the person changed.
        const changed = Object.fromEntries(
          FIELDS.filter((f) => values[f] !== defaults[f]).map((f) => [f, values[f]])
        ) as Partial<UserInput>;
        if (Object.keys(changed).length > 0) await update.mutateAsync(changed);
      }
      onClose();
    } catch (err) {
      // Server field errors land on the matching input; anything else already showed a toast.
      if (err instanceof ApiError) {
        Object.entries(err.fieldErrors).forEach(([field, message]) =>
          setError(field as keyof FormValues, { message })
        );
      }
    }
  });

  return (
    <form onSubmit={submit} noValidate className="grid gap-4">
      <Field label="Full name" required error={errors.name?.message}>
        <Input {...register('name')} autoComplete="name" />
      </Field>
      <Field label="E-mail" required error={errors.email?.message}>
        <Input type="email" autoComplete="email" {...register('email')} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Role" required error={errors.role?.message}>
          <Select {...register('role')}>
            <option value="">Select a role</option>
            {USER_ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Department" required error={errors.department?.message}>
          <Select {...register('department')}>
            <option value="">Select a department</option>
            {USER_DEPARTMENTS.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field
        label="Access scope"
        required
        hint={
          existing
            ? undefined
            : 'The new user gets an invite and shows as Pending until they accept it.'
        }
        error={errors.access_scope?.message}
      >
        <Select {...register('access_scope')}>
          <option value="">Select an access scope</option>
          {USER_ACCESS_SCOPES.map((scope) => (
            <option key={scope} value={scope}>
              {scope}
            </option>
          ))}
        </Select>
      </Field>
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" loading={formState.isSubmitting}>
          {existing ? 'Save changes' : 'Send invite'}
        </Button>
      </div>
    </form>
  );
}

/**
 * Add (no `user`) and edit (with `user`) in one dialog. The form is mounted only while the dialog is
 * open, so every opening starts from the stored values.
 */
export function UserFormDialog({
  open,
  user,
  onClose
}: {
  open: boolean;
  user?: HireAdminUser;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} title={user ? 'Edit User' : 'Add User'}>
      <UserForm existing={user} onClose={onClose} />
    </Dialog>
  );
}
